import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketSummary } from "@/hooks/useMarkets";
import { format } from "date-fns";
import { Clock, Users, ShieldCheck } from "lucide-react";
import { formatEther } from "ethers";

type MarketListProps = {
  markets: MarketSummary[];
  selectedMarketId?: bigint;
  onSelect: (marketId: bigint) => void;
  isLoading: boolean;
};

const formatDateTime = (timestamp: number) =>
  format(new Date(timestamp * 1000), "PPpp");

export const MarketList = ({ markets, selectedMarketId, onSelect, isLoading }: MarketListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-muted/40 animate-pulse h-36" />
        <Card className="p-6 bg-muted/40 animate-pulse h-36" />
      </div>
    );
  }

  if (!markets || markets.length === 0) {
    return (
      <Card className="p-8 bg-gradient-card border-border text-center">
        <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Markets Available</h3>
        <p className="text-sm text-muted-foreground">
          Markets will appear here once they are created on-chain.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {markets.map((market) => {
        const isSelected = selectedMarketId === market.id;
        const disabled = market.isSettled;
        const statusLabel = disabled ? "Settled" : "Open";
        const statusVariant = disabled ? "outline" : "default";

        return (
          <Card
            data-testid="market-card"
            key={market.id.toString()}
            className={`p-6 bg-gradient-card border-border transition-all ${
              disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-glow cursor-pointer"
            } ${isSelected ? "ring-2 ring-primary" : ""}`}
            onClick={() => !disabled && onSelect(market.id)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Match #{market.id.toString()}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {market.outcomeCount} encrypted outcomes
                </p>
              </div>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Starts {formatDateTime(market.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Locks {formatDateTime(market.lockTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>
                  Pool:{" "}
                  <span className="text-foreground font-medium">
                    {Number.parseFloat(formatEther(market.escrowBalance)).toFixed(3)} ETH
                  </span>
                </span>
              </div>
              <div>
                Payout Ratio:{" "}
                <span className="text-foreground font-medium">
                  {(Number(market.payoutRatio) / Number(1_000_000n)).toFixed(2)}x
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
