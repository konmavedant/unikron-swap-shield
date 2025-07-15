import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ChainSelector } from "@/components/swap/ChainSelector";
import { SwapFlow } from "@/components/swap/SwapFlow";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { WalletInfo } from "@/components/wallet/WalletInfo";
import { useState } from "react";
import { ChainType } from "@/types";
import { useWalletStore } from "@/store/wallet";
import { useTokenData } from "@/hooks/useTokenData";

const Index = () => {
  const { address, chainType, chainId, isConnected } = useWalletStore();
  const [selectedChain, setSelectedChain] = useState<ChainType>("evm");
  
  // Get real token data
  const { tokens } = useTokenData(selectedChain);

  const handleWalletConnect = (address: string, chainType: ChainType) => {
    setSelectedChain(chainType);
  };

  const handleWalletDisconnect = () => {
    // Wallet store handles the state reset
  };

  const handleSwap = (quote: any) => {
    console.log("Executing swap with quote:", quote);
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Header />
      
      <main className="container mx-auto px-6 py-8 space-y-12">
        <HeroSection />
        
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-1 space-y-6">
            <ChainSelector />
            
            <div className="flex justify-center">
              {isConnected ? (
                <WalletInfo
                  address={address!}
                  chainType={chainType!}
                  chainId={chainId}
                  balance="1.234"
                  onDisconnect={handleWalletDisconnect}
                />
              ) : (
                <ConnectWalletButton onConnect={handleWalletConnect} />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 flex justify-center">
            <SwapFlow
              chainType={selectedChain}
              tokens={tokens}
              isConnected={isConnected}
            />
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
