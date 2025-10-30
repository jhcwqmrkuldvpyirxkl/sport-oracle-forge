import { ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { TooltipProvider } from "@/components/ui/tooltip";
import { wagmiConfig } from "@/config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

type AppProvidersProps = {
  children: ReactNode;
};

/**
 * Root providers for SportOracle DApp
 * - Wagmi for Web3 connections
 * - RainbowKit for wallet management (English UI)
 * - React Query for data fetching
 */
export const AppProviders = ({ children }: AppProvidersProps) => {
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <RainbowKitProvider
            modalSize="compact"
            locale="en-US" // Force English to avoid incomplete translations
            theme={lightTheme({
              accentColor: "#F97316",
              accentColorForeground: "#FFFFFF",
              borderRadius: "medium"
            })}
          >
            {children}
          </RainbowKitProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
