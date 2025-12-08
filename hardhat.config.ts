import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Mnemonic determinista para desarrollo/demo
// SIEMPRE genera las mismas 20 cuentas
const MNEMONIC = "test test test test test test test test test test test junk";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: {
        mnemonic: MNEMONIC,
        count: 20,
        accountsBalance: "10000000000000000000000", // 10,000 ETH por cuenta
      },
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: MNEMONIC,
        count: 20,
      },
    },
    amoy: {
      // Polygon Amoy Testnet (reemplazo de Mumbai)
      url: process.env.MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80002,
      gasPrice: 30000000000,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
      gasPrice: 50000000000,
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
};

export default config;
