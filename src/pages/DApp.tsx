import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { MarketList } from "@/components/app/MarketList";
import { BetSlipPanel } from "@/components/app/BetSlipPanel";
import { BetsHistoryTable, BetHistoryItem } from "@/components/app/BetsHistoryTable";
import { useMarketsQuery } from "@/hooks/useMarkets";
import { useBetSlipStore } from "@/store/useBetSlipStore";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { encryptBetPayload, buildCommitment } from "@/lib/fhe";
import { sportOracleAbi, sportOracleAddress } from "@/lib/contracts";
import { hexlify, parseEther } from "ethers";
import { Card } from "@/components/ui/card";

const DApp = () => {
  const { toast } = useToast();
  const { data: markets = [], isLoading, refetch } = useMarketsQuery();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [history, setHistory] = useState<BetHistoryItem[]>([]);

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

  const handleSelectMarket = (marketId: bigint) => {
    setSelectedMarket(marketId);
    setSelectedOutcome(undefined);
    setStakeEther("");
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
      const proofHex = typeof proof === "string" ? proof : hexlify(proof);

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
