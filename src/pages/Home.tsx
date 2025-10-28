import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Shield, Grid, Sparkles } from "lucide-react";
import { useMarketsQuery } from "@/hooks/useMarkets";
import { format } from "date-fns";

const Home = () => {
  const { data: markets = [] } = useMarketsQuery();
  const topMarkets = markets.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-24 px-4">
        <div className="absolute inset-0 bg-gradient-hero opacity-30 blur-3xl" />
        <div className="container mx-auto relative z-10 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              Encrypted Prediction Exchange
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Predict the matchday. Keep your edge private.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              SportOracle harnesses Zama fhEVM so every wager, stake, and payout stays encrypted until the oracle
              declares the final score. Privacy for bettors, transparency for the protocol.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/dapp">
                <Button size="lg" className="bg-gradient-accent text-primary-foreground shadow-glow">
                  Launch Encrypted Console
                </Button>
              </Link>
              <a
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                href="#live"
              >
                <Sparkles className="h-4 w-4" />
                How SportOracle Works
              </a>
            </div>
          </div>

          <Card className="p-6 bg-gradient-card border-border shadow-xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Flame className="h-5 w-5 text-primary" />
              Live encrypted predictions
            </div>
            <div className="space-y-4">
              {topMarkets.map((market) => (
                <div key={market.id.toString()} className="rounded-lg border border-border/60 p-4 bg-background/40">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Match #{market.id.toString()}</p>
                    <Badge variant={market.isSettled ? "outline" : "default"}>
                      {market.isSettled ? "Settled" : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Locks {format(new Date(market.lockTime * 1000), "PPpp")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pool: {(Number(market.escrowBalance) / 1e18).toFixed(3)} ETH · Outcomes: {market.outcomeCount}
                  </p>
                </div>
              ))}
              {!topMarkets.length && (
                <p className="text-sm text-muted-foreground">
                  Markets seed automatically once the smart contract is deployed.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>

      <section id="live" className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto space-y-10">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="mx-auto w-fit">
              Pulse Arena Insights
            </Badge>
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">Everything stays encrypted at play</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              SportOracle wraps matches, payouts, and stake ratios in homomorphic encryption. Bettors stay private, yet
              prize pools stay verifiable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 bg-gradient-card border-border">
              <Shield className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Zero-Knowledge Stakes</h3>
              <p className="text-sm text-muted-foreground">
                Bets are encrypted locally by the fhEVM SDK. Match outcomes and stake sizes only decrypt during oracle
                callbacks.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-card border-border">
              <Grid className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Dynamic Markets</h3>
              <p className="text-sm text-muted-foreground">
                Market makers publish odds and lock windows. Bettors respond in real time without leaking strategy.
              </p>
            </Card>
            <Card className="p-6 bg-gradient-card border-border">
              <Sparkles className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Automated Settlements</h3>
              <p className="text-sm text-muted-foreground">
                Oracle actors settle encrypted pools and trigger gateway decryption so winners withdraw instantly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto grid gap-10 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <Badge variant="secondary">Workflow</Badge>
            <h2 className="text-3xl font-semibold text-foreground">Four steps to an encrypted bet</h2>
            <p className="text-muted-foreground">
              Every interaction respects privacy. Encrypt locally, broadcast securely, and receive payouts powered by
              fhEVM.
            </p>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="bg-primary/10 text-primary font-semibold rounded-full w-8 h-8 flex items-center justify-center">
                  1
                </span>
                Connect any WalletConnect-compatible wallet and initialise the SDK once.
              </li>
              <li className="flex gap-3">
                <span className="bg-primary/10 text-primary font-semibold rounded-full w-8 h-8 flex items-center justify-center">
                  2
                </span>
                Select a live market, choose an encrypted outcome, and supply a private stake.
              </li>
              <li className="flex gap-3">
                <span className="bg-primary/10 text-primary font-semibold rounded-full w-8 h-8 flex items-center justify-center">
                  3
                </span>
                Broadcast encrypted payloads—only ciphertexts touch the blockchain.
              </li>
              <li className="flex gap-3">
                <span className="bg-primary/10 text-primary font-semibold rounded-full w-8 h-8 flex items-center justify-center">
                  4
                </span>
                Gateway decrypts payouts and credits winners. Withdraw immediately.
              </li>
            </ul>
          </div>
          <Card className="p-6 bg-gradient-card border-border shadow-glow">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Built for privacy native bettors</h3>
              <p className="text-sm text-muted-foreground">
                No betting slip metadata leaks. Wallet addresses, match choices, and stakes are ciphertexts until
                settlement completes, guaranteeing unbiased odds discovery.
              </p>
              <Link to="/dapp">
                <Button size="lg" className="bg-gradient-accent w-full">
                  Enter the Prediction Console
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto text-center space-y-4">
          <h2 className="text-3xl font-semibold">Launch the encrypted sportsbook</h2>
          <p className="text-sm text-primary-foreground/80 max-w-2xl mx-auto">
            Deploy the SportOracle smart contract, seed initial markets, and invite your community to wager without
            revealing strategies.
          </p>
          <Link to="/dapp">
            <Button variant="secondary" size="lg">
              Launch DApp
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
