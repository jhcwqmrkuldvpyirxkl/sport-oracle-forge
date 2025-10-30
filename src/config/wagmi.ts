import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  trustWallet
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { type Chain } from "viem";

// Define Hardhat local network
export const hardhat: Chain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH"
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] }
  },
  blockExplorers: {
    default: { name: "Local Explorer", url: "http://localhost:8545" }
  },
  testnet: true
};

// SportOracle DApp configuration
const appName = "SportOracle DApp";
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";
const sepoliaRpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const hardhatRpcUrl = "http://127.0.0.1:8545";

// Determine which chains to include based on environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === "development";
const chains = isDevelopment ? [hardhat, sepolia] : [sepolia];

// Configure wallet connectors (without Coinbase)
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, walletConnectWallet, rainbowWallet, trustWallet]
    }
  ],
  {
    appName,
    projectId
  }
);

/**
 * Wagmi configuration for SportOracle
 * - Uses Hardhat local network in development
 * - Uses Sepolia testnet in production
 * - Disables Coinbase connector explicitly
 * - Provides deterministic RPC transport for fhEVM operations
 */
export const wagmiConfig = createConfig({
  appName,
  connectors,
  chains,
  transports: {
    [hardhat.id]: http(hardhatRpcUrl),
    [sepolia.id]: http(sepoliaRpcUrl)
  },
  ssr: false
});
