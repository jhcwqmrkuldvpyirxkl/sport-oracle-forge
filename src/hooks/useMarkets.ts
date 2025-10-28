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
      if (!client || sportOracleAddress === "0x0000000000000000000000000000000000000000") {
        return FALLBACK_MARKETS;
      }

      const ids = (await client.readContract({
        address: sportOracleAddress,
        abi: sportOracleAbi,
        functionName: "getMarketIds"
      })) as bigint[];

      if (!ids.length) {
        return FALLBACK_MARKETS;
      }

      const markets = await Promise.all(
        ids.map(async (id) => {
          const raw = (await client.readContract({
            address: sportOracleAddress,
            abi: sportOracleAbi,
            functionName: "getMarket",
            args: [id]
          })) as readonly [
            bigint,
            number,
            bigint,
            bigint,
            boolean,
            number,
            bigint,
            bigint,
            boolean
          ];

          const [_id, outcomeCount, startTime, lockTime, settled, winningOutcome, escrow, ratio, pending] = raw;

          return {
            id,
            outcomeCount,
            startTime: Number(startTime),
            lockTime: Number(lockTime),
            isSettled: settled,
            winningOutcome,
            escrowBalance: escrow,
            payoutRatio: ratio,
            decryptionPending: pending
          };
        })
      );

      return markets.sort((a, b) => Number(a.id - b.id));
    },
    staleTime: 10_000,
    refetchInterval: 15_000
  });
}
