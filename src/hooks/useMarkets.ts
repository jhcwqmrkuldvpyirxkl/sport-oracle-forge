import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { sportOracleAbi, sportOracleAddress, SCALE } from "@/lib/contracts";

export type MarketSummary = {
  id: bigint;
  outcomeCount: number;
  startTime: number;
  lockTime: number;
  isSettled: boolean;
  winningOutcome: number;
  escrowBalance: bigint;
  payoutRatio: bigint;
  decryptionPending: boolean;
};

const FALLBACK_MARKETS: MarketSummary[] = [
  {
    id: 1001n,
    outcomeCount: 3,
    startTime: Math.floor(Date.now() / 1000) + 3600,
    lockTime: Math.floor(Date.now() / 1000) + 7200,
    isSettled: false,
    winningOutcome: 0,
    escrowBalance: 0n,
    payoutRatio: SCALE,
    decryptionPending: false
  }
];

export function useMarketsQuery() {
  const client = usePublicClient();

  return useQuery({
    queryKey: ["sport-oracle", "markets"],
    queryFn: async (): Promise<MarketSummary[]> => {
      // Return fallback markets if no client or contract configured
      if (!client || sportOracleAddress === "0x0000000000000000000000000000000000000000") {
        return FALLBACK_MARKETS;
      }

      try {
        // Fetch market IDs from contract
        const ids = (await client.readContract({
          address: sportOracleAddress,
          abi: sportOracleAbi,
          functionName: "getMarketIds"
        })) as bigint[];

        // Return fallback if no markets found
        if (!ids.length) {
          return FALLBACK_MARKETS;
        }

        // Fetch detailed market data for each ID
        const markets = await Promise.all(
          ids.map(async (id) => {
            const raw = (await client.readContract({
              address: sportOracleAddress,
              abi: sportOracleAbi,
              functionName: "getMarket",
              args: [id]
            })) as {
              marketId: bigint;
              outcomeCount: number;
              startTime: bigint;
              lockTime: bigint;
              settled: boolean;
              winningOutcome: number;
              escrowBalance: bigint;
              payoutRatio: bigint;
              decryptionPending: boolean;
            };

            return {
              id: raw.marketId,
              outcomeCount: raw.outcomeCount,
              startTime: Number(raw.startTime),
              lockTime: Number(raw.lockTime),
              isSettled: raw.settled,
              winningOutcome: raw.winningOutcome,
              escrowBalance: raw.escrowBalance,
              payoutRatio: raw.payoutRatio,
              decryptionPending: raw.decryptionPending
            };
          })
        );

        return markets.sort((a, b) => Number(a.id - b.id));
      } catch (error) {
        console.error("[useMarketsQuery] Error fetching markets:", error);
        return FALLBACK_MARKETS;
      }
    },
    staleTime: 10_000,
    refetchInterval: 15_000
  });
}
