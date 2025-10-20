import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Users, 
  Wallet,
  TrendingUp,
  Shield
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";

/**
 * DApp page component
 * Main betting interface with match listings
 */
const DApp = () => {
  const { toast } = useToast();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [prediction, setPrediction] = useState<number | null>(null);

  // Mock match data
  const matches = [
    {
      id: "1",
      title: "Manchester United vs Liverpool",
      bettingDeadline: "2025-01-25 14:00",
      matchTime: "2025-01-25 15:00",
      status: "Open",
      totalBettors: 156,
      poolSize: "45.8 ETH"
    },
    {
      id: "2",
      title: "Real Madrid vs Barcelona",
      bettingDeadline: "2025-01-26 18:00",
      matchTime: "2025-01-26 19:00",
      status: "Open",
      totalBettors: 203,
      poolSize: "67.2 ETH"
    },
    {
      id: "3",
      title: "Bayern Munich vs Borussia Dortmund",
      bettingDeadline: "2025-01-27 12:00",
      matchTime: "2025-01-27 13:00",
      status: "Open",
      totalBettors: 89,
      poolSize: "32.1 ETH"
    }
  ];

  const handlePlaceBet = () => {
    if (!betAmount || prediction === null) {
      toast({
        title: "Missing Information",
        description: "Please enter bet amount and select a prediction",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Bet Placed! 🎉",
      description: `Your encrypted bet of ${betAmount} ETH has been submitted`,
    });

    // Reset form
    setBetAmount("");
    setPrediction(null);
    setSelectedMatch(null);
  };

  const predictionOptions = [
    { value: 0, label: "Team A Win" },
    { value: 1, label: "Team B Win" },
    { value: 2, label: "Draw" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Live Matches
            </h1>
            <p className="text-muted-foreground">
              Place encrypted bets on upcoming sports matches
            </p>
          </div>

          {/* Wallet Connection Banner */}
          <Card className="mb-8 p-6 bg-gradient-card border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Connect Your Wallet</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to start placing encrypted bets
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-accent hover:opacity-90">
                Connect Wallet
              </Button>
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Match List */}
            <div className="lg:col-span-2 space-y-4">
              {matches.map((match) => (
                <Card 
                  key={match.id}
                  className={`p-6 bg-gradient-card border-border hover:shadow-glow transition-all cursor-pointer ${
                    selectedMatch === match.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMatch(match.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">{match.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {match.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {match.bettingDeadline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Match: {match.matchTime}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{match.totalBettors} bettors</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">{match.poolSize}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Betting Panel */}
            <div>
              <Card className="p-6 bg-gradient-card border-border sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-lg">Place Encrypted Bet</h3>
                </div>

                {selectedMatch ? (
                  <div className="space-y-6">
                    {/* Match Info */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Selected Match</p>
                      <p className="font-medium">
                        {matches.find(m => m.id === selectedMatch)?.title}
                      </p>
                    </div>

                    {/* Bet Amount */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Bet Amount (ETH)
                      </label>
                      <Input 
                        type="number"
                        placeholder="0.1"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    {/* Prediction */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Your Prediction
                      </label>
                      <div className="grid gap-2">
                        {predictionOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={prediction === option.value ? "default" : "outline"}
                            className={prediction === option.value ? "bg-gradient-accent" : ""}
                            onClick={() => setPrediction(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Notice */}
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <Shield className="h-3 w-3 inline mr-1" />
                        Your bet will be fully encrypted using FHE technology
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button 
                      className="w-full bg-gradient-accent hover:opacity-90"
                      size="lg"
                      onClick={handlePlaceBet}
                    >
                      Place Encrypted Bet
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">
                      Select a match to place your bet
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DApp;
