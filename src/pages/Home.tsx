import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Trophy, Zap, Users, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

/**
 * Homepage component
 * Features hero section, benefits, and how it works
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Encrypted Sports Betting
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Place fully encrypted bets with complete privacy using FHE technology. 
              Automated settlement and transparent rewards on every match.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/dapp">
                <Button size="lg" className="bg-gradient-accent hover:opacity-90 animate-pulse-glow">
                  Start Betting Now
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image Placeholder */}
          <div className="mt-16 relative">
            <div className="bg-gradient-card rounded-2xl p-8 shadow-card border border-border">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Trophy className="h-24 w-24 text-primary opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose SportOracle?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fully Encrypted</h3>
              <p className="text-muted-foreground">
                Your bets are encrypted using FHE technology. Nobody can see your predictions until match settlement.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Auto Settlement</h3>
              <p className="text-muted-foreground">
                Oracle-powered automatic settlement. Winners receive rewards instantly after match results.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Transparent</h3>
              <p className="text-muted-foreground">
                All prize pools and outcomes are on-chain and verifiable. Complete transparency guaranteed.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fair Rewards</h3>
              <p className="text-muted-foreground">
                Proportional reward distribution based on your bet size. The more you bet, the more you win.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Driven</h3>
              <p className="text-muted-foreground">
                Join thousands of bettors in a decentralized ecosystem. No middleman, pure peer-to-peer.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 bg-gradient-card border-border hover:shadow-glow transition-all">
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Low Fees</h3>
              <p className="text-muted-foreground">
                Minimal platform fees. More of the prize pool goes directly to winners.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="bg-gradient-accent text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Connect your Web3 wallet to access the betting platform. We support all major wallets.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="bg-gradient-accent text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Choose a Match</h3>
                <p className="text-muted-foreground">
                  Browse available sports matches and select one to bet on. Each match shows betting deadline and match time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="bg-gradient-accent text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Place Encrypted Bet</h3>
                <p className="text-muted-foreground">
                  Select your prediction (Team A, Team B, or Draw) and bet amount. Your prediction is encrypted before submission.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div className="bg-gradient-accent text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Claim Your Rewards</h3>
                <p className="text-muted-foreground">
                  After match settlement by the oracle, winners can claim their proportional rewards. It's that simple!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Betting?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join the future of sports betting with complete privacy and transparency.
          </p>
          <Link to="/dapp">
            <Button size="lg" variant="secondary" className="animate-pulse-glow">
              Launch DApp
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 SportOracle. Powered by FHE Technology.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
