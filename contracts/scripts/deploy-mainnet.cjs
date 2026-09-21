// Standalone mainnet deploy script -- deliberately NOT run through Hardhat's
// own network/task runner, since this project's Hardhat 3 setup is only
// exercised locally in tests. This talks to BNB Smart Chain directly via
// ethers, using a throwaway deployer wallet (DEPLOYER_PRIVATE_KEY in .env)
// that holds no lasting privilege -- see the ownership-transfer step at the
// end of main().
//
// Usage: node scripts/deploy-mainnet.cjs
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { ethers } = require("ethers");

// Minimal .env loader -- avoids depending on the `dotenv` package, which
// isn't installed in this project.
function loadEnvFile(envPath) {
  let contents;
  try {
    contents = fs.readFileSync(envPath, "utf8");
  } catch (e) {
    return;
  }
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile(path.join(__dirname, "..", ".env"));

// ---- Fill in before running --------------------------------------------
// Addresses are normalized via ethers.getAddress() below, so it doesn't
// matter whether they're typed in with correct EIP-55 checksum casing --
// only that the underlying hex digits are right.
const REAL_OWNER = ethers.getAddress("0x170bec84cd2be039c30befe09a57f6a132cf5c60"); // admin wallet -- becomes owner of Token + Sale
const USDT_ADDRESS = ethers.getAddress("0x55d398326f99059ff775485246999027b3197955"); // real BSC USDT (BEP-20)

const LIQUIDITY_WALLET = ethers.getAddress("0x033c20c1268c75c206affc44bc4d1356255e1937");
const ECOSYSTEM_WALLET = ethers.getAddress("0x2b8b5672ac9ba82097a50b1c6eef0e94622351f0");
const TEAM_BENEFICIARY = ethers.getAddress("0xba52506ba0085399868f0c932f0c01c060648e58");
const MARKETING_BENEFICIARY = ethers.getAddress("0x2cdc3302d62a92d2d3f83d8683e5fd34e2e1b917");
const TREASURY_WALLET = ethers.getAddress("0xb755ebe41d3222a0ffab5d9b0b4d6af847337da9");
const MARKETING_SPEND_WALLET = ethers.getAddress("0xb755ebe41d3222a0ffab5d9b0b4d6af847337da9");
// -------------------------------------------------------------------------

const RPC_URL = "https://bsc-dataseed.binance.org";
const ONE_YEAR = 365 * 24 * 3600;
const TOTAL_SUPPLY = 2_000_000_000_000n * 10n ** 18n;
const PRESALE_AMOUNT = (TOTAL_SUPPLY * 35n) / 100n;

function loadArtifact(relPath) {
  return require(path.join(__dirname, "..", "artifacts", relPath));
}

async function main() {
  const placeholders = [
    LIQUIDITY_WALLET,
    ECOSYSTEM_WALLET,
    TEAM_BENEFICIARY,
    MARKETING_BENEFICIARY,
    TREASURY_WALLET,
    MARKETING_SPEND_WALLET,
  ];
  if (placeholders.includes("0x0000000000000000000000000000000000dEaD")) {
    throw new Error("Fill in the real wallet addresses at the top of this script before running.");
  }
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY not set in contracts/.env");
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

  const bal = await provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("Deployer BNB balance:", ethers.formatEther(bal));
  if (bal === 0n) throw new Error("Deployer wallet has 0 BNB -- fund it before running.");

  const vestingArtifact = loadArtifact("@openzeppelin/contracts/finance/VestingWallet.sol/VestingWallet.json");
  const tokenArtifact = loadArtifact("contracts/AgenticCoreToken.sol/AgenticCoreToken.json");
  const saleArtifact = loadArtifact("contracts/AgenticCoreSale.sol/AgenticCoreSale.json");

  const VestingFactory = new ethers.ContractFactory(vestingArtifact.abi, vestingArtifact.bytecode, deployer);
  const TokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, deployer);
  const SaleFactory = new ethers.ContractFactory(saleArtifact.abi, saleArtifact.bytecode, deployer);

  const now = Math.floor(Date.now() / 1000);

  console.log("\nDeploying Team VestingWallet (1yr cliff + 3yr linear)...");
  const teamVesting = await VestingFactory.deploy(TEAM_BENEFICIARY, now + ONE_YEAR, 3 * ONE_YEAR);
  await teamVesting.waitForDeployment();
  console.log("Team VestingWallet:", await teamVesting.getAddress());

  console.log("\nDeploying Marketing VestingWallet (2yr pure linear)...");
  const marketingVesting = await VestingFactory.deploy(MARKETING_BENEFICIARY, now, 2 * ONE_YEAR);
  await marketingVesting.waitForDeployment();
  console.log("Marketing VestingWallet:", await marketingVesting.getAddress());

  console.log("\nDeploying AgenticCoreToken (temp owner = deployer)...");
  const token = await TokenFactory.deploy(
    deployer.address, // temporary owner -- transferred to REAL_OWNER at the end
    LIQUIDITY_WALLET,
    deployer.address, // presaleReceiver -- deployer forwards it to Sale below
    ECOSYSTEM_WALLET,
    await teamVesting.getAddress(),
    await marketingVesting.getAddress(),
  );
  await token.waitForDeployment();
  console.log("AgenticCoreToken:", await token.getAddress());

  console.log("\nDeploying AgenticCoreSale (temp owner = deployer)...");
  const sale = await SaleFactory.deploy(
    deployer.address, // temporary owner -- transferred to REAL_OWNER at the end
    await token.getAddress(),
    USDT_ADDRESS,
    TREASURY_WALLET,
    MARKETING_SPEND_WALLET,
  );
  await sale.waitForDeployment();
  console.log("AgenticCoreSale:", await sale.getAddress());

  console.log("\nExempting Sale contract from the anti-whale wallet cap...");
  await (await token.setWalletCapExempt(await sale.getAddress(), true)).wait();

  console.log("Funding Sale contract with the Presale allocation (35% of supply)...");
  await (await token.transfer(await sale.getAddress(), PRESALE_AMOUNT)).wait();

  console.log("\nTransferring ownership of Token to", REAL_OWNER, "...");
  await (await token.transferOwnership(REAL_OWNER)).wait();

  console.log("Transferring ownership of Sale to", REAL_OWNER, "...");
  await (await sale.transferOwnership(REAL_OWNER)).wait();

  console.log("\n--- Verification ---");
  console.log("Token owner:", await token.owner());
  console.log("Sale owner:", await sale.owner());
  console.log("Sale AC balance:", ethers.formatUnits(await token.balanceOf(await sale.getAddress()), 18));
  console.log("Sale exempt from wallet cap:", await token.isExemptFromWalletCap(await sale.getAddress()));

  console.log("\n--- Addresses (save these) ---");
  console.log("AgenticCoreToken:", await token.getAddress());
  console.log("AgenticCoreSale:", await sale.getAddress());
  console.log("Team VestingWallet:", await teamVesting.getAddress());
  console.log("Marketing VestingWallet:", await marketingVesting.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
