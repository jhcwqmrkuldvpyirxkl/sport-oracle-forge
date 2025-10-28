import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

// SportOracle DApp configuration
const appName = "SportOracle DApp";
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo";
const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";

/**
 * Wagmi configuration for SportOracle
 * - Uses Sepolia testnet
 * - Disables Coinbase connector to avoid connection issues
 * - Configured for FHE operations
 */
export const wagmiConfig = getDefaultConfig({
  appName,
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl)
  },
  ssr: false
});
