import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

const ONE_AC = 10n ** 18n;
const TIER1_AMOUNT = 20_000_000n * ONE_AC;
const TIER2_AMOUNT = 10_000_000n * ONE_AC;
const TIER3_AMOUNT = 5_000_000n * ONE_AC;
const TOTAL_POOL = 300n * TIER1_AMOUNT + 300n * TIER2_AMOUNT + 300n * TIER3_AMOUNT;

// Hardhat's default signer list (~20 accounts) isn't enough to exercise a
// 900-wallet campaign, so tests that need more than that generate throwaway
// wallets and fund each with just enough native gas to send one transaction.
async function makeClaimants(deployer: Awaited<ReturnType<typeof ethers.getSigners>>[number], count: number) {
  const wallets = Array.from({ length: count }, () => ethers.Wallet.createRandom().connect(ethers.provider));
  for (const wallet of wallets) {
    await deployer.sendTransaction({ to: wallet.address, value: ethers.parseEther("0.01") });
  }
  return wallets;
}

async function deploySystem() {
  const signers = await ethers.getSigners();
  const [deployer] = signers;

  // A plain ERC20 stand-in for AC is enough here -- this suite is about
  // Claim's own tiering/one-claim/sweep logic, not the real token's
  // anti-whale cap (claim amounts are far below that cap in production).
  const token = await ethers.deployContract("MockUSDT", [18]); // reuse: any standard ERC20 mint+transfer works
  const claim = await ethers.deployContract("AgenticCoreClaim", [deployer.address, await token.getAddress()]);

  await token.mint(deployer.address, TOTAL_POOL);
  await token.transfer(await claim.getAddress(), TOTAL_POOL);

  return { deployer, token, claim, otherSigners: signers.slice(1) };
}

describe("AgenticCoreClaim", () => {
  it("pays tier 1 amount to the first 300 claimants", async () => {
    const { claim, token, otherSigners } = await deploySystem();
    const claimant = otherSigners[0];

    await expect(claim.connect(claimant).claim())
      .to.emit(claim, "Claimed")
      .withArgs(claimant.address, TIER1_AMOUNT, 1n);

    expect(await token.balanceOf(claimant.address)).to.equal(TIER1_AMOUNT);
    expect(await claim.hasClaimed(claimant.address)).to.equal(true);
    expect(await claim.claimsCount()).to.equal(1n);
  });

  it("transitions to tier 2 and tier 3 at the right cumulative counts", async () => {
    const { claim, token, deployer } = await deploySystem();
    const claimants = await makeClaimants(deployer, 601);

    // Claim 300 times to exhaust tier 1, then check the 301st gets tier 2.
    for (let i = 0; i < 300; i++) {
      await claim.connect(claimants[i]).claim();
    }
    const tier2First = claimants[300];
    await claim.connect(tier2First).claim();
    expect(await token.balanceOf(tier2First.address)).to.equal(TIER2_AMOUNT);

    for (let i = 301; i < 600; i++) {
      await claim.connect(claimants[i]).claim();
    }
    const tier3First = claimants[600];
    await claim.connect(tier3First).claim();
    expect(await token.balanceOf(tier3First.address)).to.equal(TIER3_AMOUNT);
  });

  it("rejects a second claim from the same wallet", async () => {
    const { claim, otherSigners } = await deploySystem();
    const claimant = otherSigners[0];

    await claim.connect(claimant).claim();
    await expect(claim.connect(claimant).claim()).to.be.revertedWith("already claimed");
  });

  it("stops accepting claims once 900 wallets have claimed", async () => {
    const { claim, deployer } = await deploySystem();
    const claimants = await makeClaimants(deployer, 901);

    for (let i = 0; i < 900; i++) {
      await claim.connect(claimants[i]).claim();
    }
    expect(await claim.claimsCount()).to.equal(900n);

    const [amount, open] = await claim.nextClaimAmount();
    expect(open).to.equal(false);
    expect(amount).to.equal(0n);

    await expect(claim.connect(claimants[900]).claim()).to.be.revertedWith("campaign ended");
  });

  it("lets the owner end the campaign early and sweep the remainder", async () => {
    const { claim, token, deployer, otherSigners } = await deploySystem();

    await claim.connect(otherSigners[0]).claim();
    await expect(claim.connect(otherSigners[1]).endCampaign()).to.be.revertedWithCustomError(
      claim,
      "OwnableUnauthorizedAccount",
    );

    await claim.connect(deployer).endCampaign();
    await expect(claim.connect(otherSigners[1]).claim()).to.be.revertedWith("campaign ended");

    const remaining = TOTAL_POOL - TIER1_AMOUNT;
    await expect(claim.connect(deployer).sweepRemaining(deployer.address))
      .to.emit(claim, "Swept")
      .withArgs(deployer.address, remaining);
    expect(await token.balanceOf(await claim.getAddress())).to.equal(0n);
  });

  it("refuses to sweep while the campaign is still active", async () => {
    const { claim, deployer } = await deploySystem();
    await expect(claim.connect(deployer).sweepRemaining(deployer.address)).to.be.revertedWith(
      "campaign still active",
    );
  });
});
