import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { MarketList } from "@/components/app/MarketList";
import { BetSlipPanel } from "@/components/app/BetSlipPanel";
import { BetsHistoryTable, BetHistoryItem } from "@/components/app/BetsHistoryTable";
import { useMarketsQuery } from "@/hooks/useMarkets";
import { useBetSlipStore } from "@/store/useBetSlipStore";
import { useAccount, useChainId, usePublicClient, useSwitchChain, useWriteContract } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { encryptBetPayload, buildCommitment } from "@/lib/fhe";
import { sportOracleAbi, sportOracleAddress } from "@/lib/contracts";
import { parseEther, toHex } from "viem";
import { Card } from "@/components/ui/card";
import { useFHE } from "@/hooks/useFHE";
import { Button } from "@/components/ui/button";
import { EncryptionStatusPanel } from "@/components/app/EncryptionStatusPanel";
import { AlertTriangle, Network } from "lucide-react";
import { sepolia } from "wagmi/chains";
import { hardhat } from "@/config/wagmi";

const DApp = () => {
  const { toast } = useToast();
  const { data: markets = [], isLoading, refetch } = useMarketsQuery();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [history, setHistory] = useState<BetHistoryItem[]>([]);
  const { initialize, reset: resetFhe } = useFHE();
  const [isRetryingFhe, setRetryingFhe] = useState(false);

  const {
    selectedMarketId,
    selectedOutcome,
    stakeEther,
    setSelectedMarket,
    setSelectedOutcome,
    setStakeEther,
    isEncrypting,
    setEncrypting
  } = useBetSlipStore((state) => ({
    selectedMarketId: state.selectedMarketId,
    selectedOutcome: state.selectedOutcome,
    stakeEther: state.stakeEther,
    setSelectedMarket: state.setSelectedMarket,
    setSelectedOutcome: state.setSelectedOutcome,
    setStakeEther: state.setStakeEther,
    isEncrypting: state.isEncrypting,
    setEncrypting: state.setEncrypting
  }));

  const selectedMarket = useMemo(
    () => markets.find((market) => market.id === selectedMarketId),
    [markets, selectedMarketId]
  );

  // Accept both Hardhat local (31337) and Sepolia (11155111) networks
  const supportedChainIds = [hardhat.id, sepolia.id];
  const requiresNetworkSwitch = Boolean(
    isConnected && chainId !== undefined && !supportedChainIds.includes(chainId)
  );
  const networkReady = !requiresNetworkSwitch;

  const handleSelectMarket = (marketId: bigint) => {
    setSelectedMarket(marketId);
    setSelectedOutcome(undefined);
    setStakeEther("");
  };

  useEffect(() => {
    if (!isConnected) {
      return;
    }
    initialize().catch((error) => {
      console.error("[FHE] Warm-up failed:", error);
    });
  }, [initialize, isConnected]);

  const handleRetryFhe = async () => {
    setRetryingFhe(true);
    try {
      resetFhe();
      await initialize();
    } finally {
      setRetryingFhe(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      // Try Hardhat local first if in development, otherwise Sepolia
      const targetChainId = import.meta.env.DEV ? hardhat.id : sepolia.id;
      await switchChainAsync({ chainId: targetChainId });
    } catch (error) {
      toast({
        title: "Network switch failed",
        description: error instanceof Error ? error.message : "Unable to change network.",
        variant: "destructive"
      });
    }
  };

  const handlePlaceBet = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet required",
        description: "Connect a wallet to place an encrypted bet.",
        variant: "destructive"
      });
      return;
    }

    if (requiresNetworkSwitch) {
      const networkName = import.meta.env.DEV ? "Hardhat Local or Sepolia" : "Sepolia";
      toast({
        title: "Wrong network",
        description: `Switch to ${networkName} before placing an encrypted bet.`,
        variant: "destructive"
      });
      return;
    }

    if (!selectedMarketId) {
      toast({
        title: "Select a market",
        description: "Choose a live market to continue.",
        variant: "destructive"
      });
      return;
    }

    if (selectedOutcome === undefined) {
      toast({
        title: "Prediction missing",
        description: "Choose an outcome before encrypting.",
        variant: "destructive"
      });
      return;
    }

    const stakeValue = stakeEther.trim();
    if (!stakeValue) {
      toast({
        title: "Enter stake",
        description: "Provide a stake in ETH to encrypt.",
        variant: "destructive"
      });
      return;
    }

    let stakeWei: bigint;
    try {
      stakeWei = parseEther(stakeValue);
    } catch {
      toast({
        title: "Invalid amount",
        description: "Stake must be a valid ETH value.",
        variant: "destructive"
      });
      return;
    }

    if (stakeWei <= 0n) {
      toast({
        title: "Stake too small",
        description: "Increase the amount above zero.",
        variant: "destructive"
      });
      return;
    }

    if (sportOracleAddress === "0x0000000000000000000000000000000000000000") {
      toast({
        title: "Contract unavailable",
        description: "Configure VITE_CONTRACT_ADDRESS to broadcast transactions.",
        variant: "destructive"
      });
      return;
    }

    try {
      await initialize();
      setEncrypting(true);

      const { encryptedOutcome, encryptedStake, proof } = await encryptBetPayload(
        sportOracleAddress,
        address,
        selectedOutcome,
        stakeWei
      );

      const commitment = buildCommitment(
        encryptedOutcome as `0x${string}`,
        encryptedStake as `0x${string}`,
        address
      );

      // Handle proof conversion: CDN SDK may return string or Uint8Array
      const proofHex = typeof proof === "string" ? proof : toHex(proof);

      const txHash = await writeContractAsync({
        address: sportOracleAddress,
        abi: sportOracleAbi,
        functionName: "placeBet",
        args: [selectedMarketId, encryptedOutcome, encryptedStake, proofHex, commitment],
        value: stakeWei
      });

      setHistory((prev) => [
        {
          marketId: selectedMarketId,
          outcome: selectedOutcome,
          stakeWei,
          txHash,
          createdAt: Date.now(),
          status: "pending"
        },
        ...prev
      ]);

      toast({
        title: "Encrypted bet submitted",
        description: "Waiting for confirmation from the network."
      });

      setSelectedOutcome(undefined);
      setStakeEther("");

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        setHistory((prev) =>
          prev.map((entry) => (entry.txHash === txHash ? { ...entry, status: "success" } : entry))
        );
        await refetch();
      }
    } catch (error) {
      setHistory((prev) =>
        prev.map((entry) => (entry.status === "pending" ? { ...entry, status: "failed" } : entry))
      );

      toast({
        title: "Encryption failed",
        description: error instanceof Error ? error.message : "Unable to encrypt bet payload.",
        variant: "destructive"
      });
    } finally {
      setEncrypting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto space-y-8">
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-primary">Encrypted Prediction Markets</p>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Bet Privately. Win Transparently.
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Compose fully encrypted wagers with Zama fhEVM. Stakes and predictions stay private until the Oracle
              decrypts settlement outcomes.
            </p>
          </header>

          <EncryptionStatusPanel onRetry={handleRetryFhe} isRetrying={isRetryingFhe} />

          {requiresNetworkSwitch && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-background/80 flex items-center justify-center shadow-inner">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Network className="h-4 w-4 text-amber-400" />
                    Wrong Network Detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    SportOracle is deployed on {import.meta.env.DEV ? "Hardhat Local (31337) or Sepolia" : "Sepolia"}. Switch networks to continue placing encrypted bets.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto border-amber-500/60 text-amber-400 hover:bg-amber-500/10"
                onClick={handleSwitchNetwork}
                disabled={isSwitchingChain}
              >
                {isSwitchingChain ? "Switching..." : `Switch to ${import.meta.env.DEV ? "Hardhat Local" : "Sepolia"}`}
              </Button>
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <MarketList
                markets={markets}
                isLoading={isLoading}
                selectedMarketId={selectedMarketId}
                onSelect={handleSelectMarket}
              />
            </div>
            <BetSlipPanel
              selectedMarket={selectedMarket}
              isEncrypting={isEncrypting}
              onPlaceBet={handlePlaceBet}
              walletConnected={isConnected}
              networkReady={networkReady}
              onSwitchNetwork={requiresNetworkSwitch ? handleSwitchNetwork : undefined}
            />
          </div>

          <Card className="p-6 bg-gradient-card border-border space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Encrypted Bet History</h2>
              <p className="text-sm text-muted-foreground">
                Recently submitted bets with anonymised outcomes. Decrypted payouts appear once the gateway finalises a
                settlement.
              </p>
            </div>
            <BetsHistoryTable entries={history} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DApp;
