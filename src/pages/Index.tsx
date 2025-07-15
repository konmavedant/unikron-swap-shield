import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { ChainSelector } from "@/components/swap/ChainSelector";
import { SwapForm } from "@/components/swap/SwapForm";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { WalletInfo } from "@/components/wallet/WalletInfo";
import { useState } from "react";
import { Token, ChainType } from "@/types";

const Index = () => {
  const [walletState, setWalletState] = useState<{
    address: string | null;
    chainType: ChainType | null;
    chainId?: number;
    isConnected: boolean;
  }>({
    address: null,
    chainType: null,
    isConnected: false,
  });

  const [selectedChain, setSelectedChain] = useState<ChainType>("evm");

  // Mock tokens - in real implementation, these would come from your API
  const mockTokens: Token[] = [
    {
      address: "0x...",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      logoURI: "/tokens/eth.png",
      chainId: 1,
      balance: "1.234"
    },
    {
      address: "0x...",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "/tokens/usdc.png",
      chainId: 1,
      balance: "1,234.56"
    }
  ];

  const handleWalletConnect = (address: string, chainType: ChainType) => {
    setWalletState({
      address,
      chainType,
      chainId: chainType === 'evm' ? 1 : undefined,
      isConnected: true,
    });
    setSelectedChain(chainType);
  };

  const handleWalletDisconnect = () => {
    setWalletState({
      address: null,
      chainType: null,
      isConnected: false,
    });
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
              {walletState.isConnected ? (
                <WalletInfo
                  address={walletState.address!}
                  chainType={walletState.chainType!}
                  chainId={walletState.chainId}
                  balance="1.234"
                  onDisconnect={handleWalletDisconnect}
                />
              ) : (
                <ConnectWalletButton onConnect={handleWalletConnect} />
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 flex justify-center">
            <SwapForm
              chainType={selectedChain}
              tokens={mockTokens}
              onSwap={handleSwap}
              isConnected={walletState.isConnected}
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
