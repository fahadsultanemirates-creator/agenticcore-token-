import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// BSC mainnet is only listed here for reference/verification later -- actual
// deployment for this project goes through Remix + a connected wallet, not
// through this config, so no private key ever needs to live here.
export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.24",
    // Points at the solc-js package installed locally via npm, since the
    // sandbox this was authored in can't reach binaries.soliditylang.org to
    // auto-download a compiler. Harmless to leave in for normal use too --
    // it just skips a network round-trip Hardhat would otherwise make.
    path: path.join(__dirname, "node_modules/solc/soljson.js"),
    // VestingWallet is deployed directly (for Team and Marketing) but never
    // inherited by any of this project's own contracts, so it needs to be
    // listed explicitly to get its own build artifact.
    npmFilesToBuild: ["@openzeppelin/contracts/finance/VestingWallet.sol"],
  },
  networks: {
    bscMainnet: {
      type: "http",
      chainType: "l1",
      url: "https://bsc-dataseed.binance.org",
      accounts: [],
    },
  },
});
