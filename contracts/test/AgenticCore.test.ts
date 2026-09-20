import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

const ONE_AC = 10n ** 18n;
const TOTAL_SUPPLY = 2_000_000_000_000n * ONE_AC;
const AC_PER_USDT = 10_000_000n;
const LEVEL_RATES_BPS = [2000n, 1000n, 500n, 500n, 250n, 250n, 250n, 250n, 250n, 250n];
const BPS = 10_000n;

async function deployVestingWallet(beneficiary: string, startTimestamp: number, durationSeconds: number) {
  const factory = await ethers.getContractFactory(
    "@openzeppelin/contracts/finance/VestingWallet.sol:VestingWallet",
  );
  return factory.deploy(beneficiary, startTimestamp, durationSeconds);
}

async function deploySystem(usdtDecimals = 18) {
  const signers = await ethers.getSigners();
  const [
    deployer,
    liquidityWallet,
    ecosystemWallet,
    teamBeneficiary,
    marketingBeneficiary,
    treasury,
    ...rest
  ] = signers;

  const usdt = await ethers.deployContract("MockUSDT", [usdtDecimals]);
  const usdtScale = 10n ** BigInt(usdtDecimals);

  const now = await networkHelpers.time.latest();
  const teamVesting = await deployVestingWallet(teamBeneficiary.address, now + 365 * 24 * 3600, 3 * 365 * 24 * 3600);
  const marketingVesting = await deployVestingWallet(marketingBeneficiary.address, now, 2 * 365 * 24 * 3600);

  const token = await ethers.deployContract("AgenticCoreToken", [
    liquidityWallet.address,
    deployer.address, // presaleReceiver -- deployer holds it until transferred to Sale
    ecosystemWallet.address,
    await teamVesting.getAddress(),
    await marketingVesting.getAddress(),
  ]);

  const sale = await ethers.deployContract("AgenticCoreSale", [
    deployer.address,
    await token.getAddress(),
    await usdt.getAddress(),
    treasury.address,
  ]);

  // Fund the sale contract with the Presale allocation (20% of supply).
  const presaleAmount = (TOTAL_SUPPLY * 20n) / 100n;
  await token.connect(deployer).transfer(await sale.getAddress(), presaleAmount);

  async function fundAndApprove(signer: (typeof rest)[number], wholeUsdt: bigint) {
    await usdt.mint(signer.address, wholeUsdt * usdtScale);
    await usdt.connect(signer).approve(await sale.getAddress(), wholeUsdt * usdtScale);
  }

  return {
    deployer,
    liquidityWallet,
    ecosystemWallet,
    teamBeneficiary,
    marketingBeneficiary,
    teamVesting,
    marketingVesting,
    treasury,
    buyers: rest,
    usdt,
    usdtScale,
    token,
    sale,
    fundAndApprove,
  };
}

describe("AgenticCoreToken", function () {
  it("mints the exact fixed supply, split across all five destinations with no dust lost", async function () {
    const { token, liquidityWallet, ecosystemWallet, teamVesting, marketingVesting, deployer, sale } =
      await deploySystem();

    expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    expect(await token.balanceOf(liquidityWallet.address)).to.equal((TOTAL_SUPPLY * 25n) / 100n);
    expect(await token.balanceOf(ecosystemWallet.address)).to.equal((TOTAL_SUPPLY * 10n) / 100n);

    // Team/Marketing allocations sit in their VestingWallet contracts, not
    // the beneficiaries directly, until vesting releases them over time.
    expect(await token.balanceOf(await teamVesting.getAddress())).to.equal((TOTAL_SUPPLY * 15n) / 100n);
    expect(await token.balanceOf(await marketingVesting.getAddress())).to.equal((TOTAL_SUPPLY * 30n) / 100n);

    // Presale allocation (20%) started at the deployer, then got forwarded to the Sale contract in deploySystem().
    expect(await token.balanceOf(await sale.getAddress())).to.equal((TOTAL_SUPPLY * 20n) / 100n);
    expect(await token.balanceOf(deployer.address)).to.equal(0n);
  });

  it("rejects a zero address for any destination", async function () {
    const { liquidityWallet, ecosystemWallet, teamBeneficiary, marketingBeneficiary } = await deploySystem();
    await expect(
      ethers.deployContract("AgenticCoreToken", [
        ethers.ZeroAddress,
        liquidityWallet.address,
        ecosystemWallet.address,
        teamBeneficiary.address,
        marketingBeneficiary.address,
      ]),
    ).to.be.revertedWith("liquidityWallet is zero");
  });
});

describe("AgenticCoreSale - direct buys", function () {
  it("mints the base AC rate and routes 100% of USDT to treasury for a non-referred buy", async function () {
    const { sale, usdt, token, treasury, buyers, fundAndApprove } = await deploySystem();
    const [buyer] = buyers;
    await fundAndApprove(buyer, 25n);

    await expect(sale.connect(buyer).buy(25n, ethers.ZeroAddress))
      .to.emit(sale, "Purchase")
      .withArgs(buyer.address, ethers.ZeroAddress, 25n * 10n ** 18n, 25n * AC_PER_USDT * ONE_AC, false);

    expect(await token.balanceOf(buyer.address)).to.equal(25n * AC_PER_USDT * ONE_AC);
    expect(await usdt.balanceOf(treasury.address)).to.equal(25n * 10n ** 18n);
    expect(await sale.vipPoolBalance()).to.equal(0n);
  });

  it("enforces the $5 minimum", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [buyer] = buyers;
    await fundAndApprove(buyer, 4n);
    await expect(sale.connect(buyer).buy(4n, ethers.ZeroAddress)).to.be.revertedWith("below minimum buy");
  });

  it("enforces the $1000 lifetime cap per wallet, across multiple purchases", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [buyer] = buyers;
    await fundAndApprove(buyer, 1000n);

    await sale.connect(buyer).buy(600n, ethers.ZeroAddress);
    await expect(sale.connect(buyer).buy(500n, ethers.ZeroAddress)).to.be.revertedWith("exceeds wallet cap");

    // Exactly filling the remaining cap is fine.
    await sale.connect(buyer).buy(400n, ethers.ZeroAddress);
    expect(await sale.totalPurchasedUsd(buyer.address)).to.equal(1000n);
  });
});

describe("AgenticCoreSale - referred buys", function () {
  it("mints a 10% AC bonus and pays a two-level chain correctly, overflowing the rest to treasury", async function () {
    const { sale, usdt, token, treasury, buyers, fundAndApprove } = await deploySystem();
    const [buyer, ref1, ref2] = buyers;

    // Chain: buyer -> ref1 -> ref2 -> (no further upline)
    await fundAndApprove(ref2, 5n);
    await sale.connect(ref2).buy(5n, ethers.ZeroAddress);
    await fundAndApprove(ref1, 5n);
    await sale.connect(ref1).buy(5n, ref2.address);

    await fundAndApprove(buyer, 100n);
    const treasuryBefore = await usdt.balanceOf(treasury.address);
    const ref1Before = await usdt.balanceOf(ref1.address);
    const ref2Before = await usdt.balanceOf(ref2.address);
    // The seeding purchase above (ref1 referred by ref2) was itself a
    // referred buy, so it already swept its own 10% into the VIP pool --
    // isolate this purchase's contribution with a delta, not an absolute.
    const vipPoolBefore = await sale.vipPoolBalance();

    await sale.connect(buyer).buy(100n, ref1.address);

    const usdtAmount = 100n * 10n ** 18n;
    const expectedAc = (100n * AC_PER_USDT * ONE_AC * 11000n) / BPS; // +10% bonus
    expect(await token.balanceOf(buyer.address)).to.equal(expectedAc);

    const level1Payout = (usdtAmount * LEVEL_RATES_BPS[0]) / BPS;
    const level2Payout = (usdtAmount * LEVEL_RATES_BPS[1]) / BPS;
    // Deltas, not raw balances -- the seeding purchases above already paid
    // ref2 a small commission as ref1's own direct referrer.
    expect((await usdt.balanceOf(ref1.address)) - ref1Before).to.equal(level1Payout);
    expect((await usdt.balanceOf(ref2.address)) - ref2Before).to.equal(level2Payout);

    const vipCut = (usdtAmount * 1000n) / BPS;
    expect((await sale.vipPoolBalance()) - vipPoolBefore).to.equal(vipCut);

    // Levels 3-10 have no real upline beyond ref2, so their payouts fall to
    // treasury -- and referral levels (55%) + VIP cut (10%) only account
    // for 65% of any referred purchase to begin with, so the remaining 35%
    // structural remainder lands there too.
    const overflowLevels = LEVEL_RATES_BPS.slice(2).reduce((sum, bps) => sum + (usdtAmount * bps) / BPS, 0n);
    const structuralRemainder = (usdtAmount * 3500n) / BPS;
    expect(await usdt.balanceOf(treasury.address)).to.equal(treasuryBefore + overflowLevels + structuralRemainder);
  });

  it("pays out a full 10-level chain with no overflow to treasury", async function () {
    const { sale, usdt, treasury, buyers, fundAndApprove } = await deploySystem();
    // buyers[0] is the ultimate buyer; buyers[1..10] are 10 uplines, deepest first.
    const chain = buyers.slice(0, 11); // [buyer, U1, U2, ..., U10]

    // Seed every upline with a qualifying purchase first (no referrer needed for the root).
    for (let i = chain.length - 1; i >= 1; i--) {
      const account = chain[i];
      const referrer = i === chain.length - 1 ? ethers.ZeroAddress : chain[i + 1].address;
      await fundAndApprove(account, 5n);
      await sale.connect(account).buy(5n, referrer);
    }

    const buyer = chain[0];
    const directRef = chain[1];
    await fundAndApprove(buyer, 100n);

    // Snapshot every upline's USDT balance right before the purchase whose
    // effect we're isolating -- the seeding loop above already cascaded
    // small commissions up this same chain, so only a before/after delta
    // correctly isolates this one purchase's payout per level.
    const balancesBefore = await Promise.all(chain.slice(1).map((account) => usdt.balanceOf(account.address)));
    const treasuryBefore = await usdt.balanceOf(treasury.address);

    await sale.connect(buyer).buy(100n, directRef.address);

    const usdtAmount = 100n * 10n ** 18n;
    for (let level = 0; level < 10; level++) {
      const expectedPayout = (usdtAmount * LEVEL_RATES_BPS[level]) / BPS;
      const balanceAfter = await usdt.balanceOf(chain[level + 1].address);
      expect(balanceAfter - balancesBefore[level]).to.equal(expectedPayout);
    }

    // Referral levels (55%) + VIP cut (10%) only account for 65% of a
    // referred purchase -- the remaining 35% has nowhere else specified to
    // go, so it correctly falls to treasury the same way an unfilled level
    // would. A full 10-level chain removes the "unfilled level" case, but
    // not this structural remainder.
    const remainderToTreasury = (usdtAmount * 3500n) / BPS;
    expect(await usdt.balanceOf(treasury.address)).to.equal(treasuryBefore + remainderToTreasury);

    const vipCut = (usdtAmount * 1000n) / BPS;
    expect(await usdt.balanceOf(await sale.getAddress())).to.equal(await sale.vipPoolBalance());
    expect(await sale.vipPoolBalance()).to.be.greaterThanOrEqual(vipCut);
  });

  it("never lets a second referral link override the first-touch referrer", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [buyer, ref1, ref2] = buyers;
    await fundAndApprove(buyer, 50n);

    await sale.connect(buyer).buy(25n, ref1.address);
    expect(await sale.referrerOf(buyer.address)).to.equal(ref1.address);

    await sale.connect(buyer).buy(25n, ref2.address);
    expect(await sale.referrerOf(buyer.address)).to.equal(ref1.address);
  });

  it("ignores a self-referral", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [buyer] = buyers;
    await fundAndApprove(buyer, 25n);
    await sale.connect(buyer).buy(25n, buyer.address);
    expect(await sale.referrerOf(buyer.address)).to.equal(ethers.ZeroAddress);
  });
});

describe("AgenticCoreSale - decimal handling", function () {
  it("produces identical AC amounts and USDT splits regardless of the USDT token's decimals", async function () {
    const results: Array<{ ac: bigint; treasury: bigint }> = [];

    for (const decimals of [6, 18]) {
      const { sale, usdt, token, treasury, buyers, fundAndApprove } = await deploySystem(decimals);
      const [buyer] = buyers;
      await fundAndApprove(buyer, 40n);
      await sale.connect(buyer).buy(40n, ethers.ZeroAddress);

      results.push({
        ac: await token.balanceOf(buyer.address),
        treasury: (await usdt.balanceOf(treasury.address)) / 10n ** BigInt(decimals),
      });
    }

    expect(results[0].ac).to.equal(results[1].ac);
    expect(results[0].treasury).to.equal(results[1].treasury);
    expect(results[0].ac).to.equal(40n * AC_PER_USDT * ONE_AC);
  });
});

describe("AgenticCoreSale - VIP Pool", function () {
  it("qualifies a wallet via its own personal buy volume reaching $1000", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [buyer] = buyers;
    await fundAndApprove(buyer, 1000n);

    await sale.connect(buyer).buy(995n, ethers.ZeroAddress);
    expect(await sale.qualifiedSince(buyer.address)).to.equal(0n);

    await expect(sale.connect(buyer).buy(5n, ethers.ZeroAddress)).to.emit(sale, "VipQualified");
    expect(await sale.qualifiedSince(buyer.address)).to.not.equal(0n);
  });

  it("qualifies a wallet via its own direct-referral sales reaching $1000, not indirect ones", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [top, direct, indirect] = buyers;

    await fundAndApprove(direct, 5n);
    await sale.connect(direct).buy(5n, top.address);

    await fundAndApprove(indirect, 1000n);
    // indirect refers through `direct`, so `top` only earns level-2 commission and level-2 volume shouldn't count toward top's direct-sales qualification.
    await sale.connect(indirect).buy(1000n, direct.address);

    expect(await sale.qualifiedSince(top.address)).to.equal(0n);
    expect(await sale.qualifiedSince(direct.address)).to.not.equal(0n);
  });

  it("rejects closing the week early, then allows close and correct even-split claims", async function () {
    const { sale, usdt, buyers, fundAndApprove } = await deploySystem();
    const [buyerA, buyerB, referrer] = buyers;

    await expect(sale.closeCurrentWeek()).to.be.revertedWith("week not over yet");

    // Qualify buyerA and buyerB via personal volume, both referred so the pool actually accrues.
    await fundAndApprove(referrer, 5n);
    await sale.connect(referrer).buy(5n, ethers.ZeroAddress);

    await fundAndApprove(buyerA, 1000n);
    await sale.connect(buyerA).buy(1000n, referrer.address);
    await fundAndApprove(buyerB, 1000n);
    await sale.connect(buyerB).buy(1000n, referrer.address);

    expect(await sale.qualifiedSince(buyerA.address)).to.not.equal(0n);
    expect(await sale.qualifiedSince(buyerB.address)).to.not.equal(0n);
    // The referrer's own direct-referral sales also crossed $1000 (two
    // $1000 downline purchases), so it qualifies too -- three qualified
    // members total, not just the two buyers.
    expect(await sale.qualifiedSince(referrer.address)).to.not.equal(0n);
    expect(await sale.totalQualifiedCount()).to.equal(3n);

    const poolBefore = await sale.vipPoolBalance();
    expect(poolBefore).to.be.greaterThan(0n);

    const nextPayout = await sale.nextPayoutTimestamp();
    await networkHelpers.time.increaseTo(nextPayout);

    // Read the timestamp back off the actually-mined block rather than
    // predicting it via time.latest() called separately -- evaluating that
    // as a withArgs() argument races against the tx's own mining and can
    // land a second off.
    const closeTx = await sale.closeCurrentWeek();
    const closeReceipt = await closeTx.wait();
    const closeBlock = await ethers.provider.getBlock(closeReceipt!.blockNumber);
    await expect(closeTx)
      .to.emit(sale, "VipWeekClosed")
      .withArgs(0n, poolBefore, 3n, BigInt(closeBlock!.timestamp));

    expect(await sale.vipPoolBalance()).to.equal(0n);
    expect(await sale.currentWeekId()).to.equal(1n);

    const expectedShare = poolBefore / 3n;
    await expect(sale.connect(buyerA).claimVipShare(0n))
      .to.emit(sale, "VipShareClaimed")
      .withArgs(buyerA.address, 0n, expectedShare);
    expect(await usdt.balanceOf(buyerA.address)).to.equal(expectedShare);

    await expect(sale.connect(buyerA).claimVipShare(0n)).to.be.revertedWith("already claimed");
  });

  it("does not let a wallet that qualifies after a week closes claim that week's pool", async function () {
    const { sale, buyers, fundAndApprove } = await deploySystem();
    const [earlyQualifier, lateQualifier, referrer] = buyers;

    await fundAndApprove(referrer, 5n);
    await sale.connect(referrer).buy(5n, ethers.ZeroAddress);

    await fundAndApprove(earlyQualifier, 1000n);
    await sale.connect(earlyQualifier).buy(1000n, referrer.address);

    const nextPayout = await sale.nextPayoutTimestamp();
    await networkHelpers.time.increaseTo(nextPayout);
    await sale.closeCurrentWeek();

    // Qualifies only after week 0 already closed.
    await fundAndApprove(lateQualifier, 1000n);
    await sale.connect(lateQualifier).buy(1000n, referrer.address);

    await expect(sale.connect(lateQualifier).claimVipShare(0n)).to.be.revertedWith("not eligible for this week");
  });
});
