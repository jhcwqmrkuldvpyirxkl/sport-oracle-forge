import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

/**
 * Main navigation bar component
 * Displays logo and navigation links
 */
const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              SportOracle
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Button className="bg-gradient-accent hover:opacity-90">Connect Wallet</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
