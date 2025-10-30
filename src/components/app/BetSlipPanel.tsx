import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { useBetSlipStore } from "@/store/useBetSlipStore";
import { MarketSummary } from "@/hooks/useMarkets";
import { useEffect, useMemo } from "react";

type BetSlipPanelProps = {
  selectedMarket?: MarketSummary;
  isEncrypting: boolean;
  onPlaceBet: () => Promise<void>;
  walletConnected: boolean;
  networkReady: boolean;
  onSwitchNetwork?: () => void;
};

const OUTCOME_LABELS = ["Team A Victory", "Team B Victory", "Draw"];

export const BetSlipPanel = ({
  selectedMarket,
  isEncrypting,
  onPlaceBet,
  walletConnected,
  networkReady,
  onSwitchNetwork
}: BetSlipPanelProps) => {
  const {
    selectedOutcome,
    stakeEther,
    setSelectedOutcome,
    setStakeEther,
    setEncrypting
  } = useBetSlipStore((state) => ({
    selectedOutcome: state.selectedOutcome,
    stakeEther: state.stakeEther,
    setSelectedOutcome: state.setSelectedOutcome,
    setStakeEther: state.setStakeEther,
    setEncrypting: state.setEncrypting
  }));

  useEffect(() => {
    setEncrypting(isEncrypting);
  }, [isEncrypting, setEncrypting]);

  const outcomeOptions = useMemo(() => {
    if (!selectedMarket) return [];
    return Array.from({ length: selectedMarket.outcomeCount }, (_, index) => ({
      value: index,
      label: OUTCOME_LABELS[index] || `Outcome ${index + 1}`
    }));
  }, [selectedMarket]);

  const disabled = !selectedMarket || isEncrypting || !networkReady;

  const handleSubmit = async () => {
    if (disabled || !selectedMarket) return;
    await onPlaceBet();
  };

  return (
    <div className="p-6 bg-gradient-card border-border rounded-xl shadow-card space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Encrypted Bet Slip</h3>
      </div>

      {!selectedMarket ? (
        <div className="text-sm text-muted-foreground">
          Select a market to begin composing your encrypted wager.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Selected Match</p>
            <p className="text-sm font-medium text-foreground">Match #{selectedMarket.id.toString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">Choose Outcome</label>
            <div className="grid gap-2">
              {outcomeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedOutcome === option.value ? "default" : "outline"}
                  className={selectedOutcome === option.value ? "bg-gradient-accent" : ""}
                  onClick={() => setSelectedOutcome(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="stake" className="text-xs font-medium text-muted-foreground uppercase">
              Stake (ETH)
            </label>
            <Input
              id="stake"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.25"
              value={stakeEther}
              onChange={(event) => setStakeEther(event.target.value)}
            />
          </div>

          <Button className="w-full bg-gradient-accent hover:opacity-90" size="lg" disabled={disabled} onClick={handleSubmit}>
            {isEncrypting ? "Encrypting..." : "Place Encrypted Bet"}
          </Button>

          {!walletConnected && (
            <p className="text-xs text-muted-foreground text-center">
              Connect a wallet to transmit encrypted handles on-chain.
            </p>
          )}

          {walletConnected && !networkReady && (
            <div className="text-xs text-amber-500 text-center space-y-2">
              <p>Switch to the Sepolia testnet to submit encrypted bets.</p>
              {onSwitchNetwork && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/60 text-amber-500 hover:bg-amber-500/10"
                  onClick={onSwitchNetwork}
                >
                  Switch Network
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
