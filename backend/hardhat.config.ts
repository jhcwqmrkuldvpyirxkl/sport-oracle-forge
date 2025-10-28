import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import { HardhatUserConfig } from "hardhat/config";
import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-toolbox";

loadEnv({ path: resolve(__dirname, "..", ".env") });

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      evmVersion: "cancun"
    }
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  fhEVM: {
    gatewayUrl: process.env.FHE_GATEWAY_URL || "https://gateway.sepolia.zama.ai"
  },
  typechain: {
    outDir: "types",
    target: "ethers-v6"
  }
};

export default config;
