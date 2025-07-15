import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ChainSelector } from "@/components/ChainSelector";
import { SwapInterface } from "@/components/SwapInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-12">
        <HeroSection />
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1">
            <ChainSelector />
          </div>
          
          <div className="lg:col-span-2 flex justify-center">
            <SwapInterface />
          </div>
        </div>
        
        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-cosmic flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">MEV Protection</h3>
            <p className="text-sm text-muted-foreground">
              Commit-reveal protocol prevents front-running and sandwich attacks
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-shield flex items-center justify-center">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Cross-Chain</h3>
            <p className="text-sm text-muted-foreground">
              Seamless swaps across EVM and Solana ecosystems
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card/50 border border-border/50">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
            <p className="text-sm text-muted-foreground">
              Advanced routing across multiple DEXes for optimal pricing
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
