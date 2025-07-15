import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, Shield, Zap, Settings } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { TokenSelector } from "./TokenSelector";
import { SwapQuoteDisplay } from "./SwapQuoteDisplay";
import { Token, SwapQuote, ChainType } from "@/types";
import { useSwapQuote, useCreateSwap } from "@/hooks/useApi";
import { useSwapStore } from "@/store/swap";
import { useWalletStore } from "@/store/wallet";
import { toast } from "@/hooks/use-toast";

interface SwapFormProps {
  chainType: ChainType;
  tokens: Token[];
  onSwap?: (quote: SwapQuote) => void;
  isConnected?: boolean;
}

export const SwapForm = ({ 
  chainType, 
  tokens, 
  onSwap, 
  isConnected = false 
}: SwapFormProps) => {
  // Local state for MEV protection
  const [mevProtection, setMevProtection] = useState(true);
  
  // Global swap state
  const {
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    quote,
    config,
    isLoadingQuote,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setQuote,
    setLoadingQuote,
    setConfig,
    swapTokens: swapTokenPositions,
  } = useSwapStore();

  // Wallet state
  const { address } = useWalletStore();

  // Create quote request
  const quoteRequest = useMemo(() => {
    if (!inputToken || !outputToken || !inputAmount || !address || parseFloat(inputAmount) <= 0) {
      return null;
    }

    return {
      inputToken: inputToken.address,
      outputToken: outputToken.address,
      inputAmount: (parseFloat(inputAmount) * Math.pow(10, inputToken.decimals)).toString(),
      slippage: config.slippage,
      user: address,
      config,
    };
  }, [inputToken, outputToken, inputAmount, config, address]);

  // Get quote from API
  const { 
    data: quoteData, 
    isLoading: quoteLoading, 
    error: quoteError 
  } = useSwapQuote(chainType, quoteRequest, isConnected);

  // Create swap mutation
  const createSwapMutation = useCreateSwap();

  // Update quote when API data changes
  useEffect(() => {
    setLoadingQuote(quoteLoading);
    if (quoteData && !quoteLoading) {
      setQuote(quoteData);
    } else if (!quoteLoading) {
      setQuote(null);
    }
  }, [quoteData, quoteLoading, setQuote, setLoadingQuote]);

  // Handle quote errors
  useEffect(() => {
    if (quoteError) {
      toast({
        title: "Quote Error",
        description: quoteError.message,
        variant: "destructive",
      });
    }
  }, [quoteError]);

  const handleSwap = async () => {
    if (!quote || !inputToken || !outputToken || !address) return;

    try {
      const swapRequest = {
        inputToken: inputToken.address,
        outputToken: outputToken.address,
        inputAmount: (parseFloat(inputAmount) * Math.pow(10, inputToken.decimals)).toString(),
        minOutputAmount: quote.minOutputAmount,
        slippage: config.slippage,
        user: address,
        deadline: Math.floor(Date.now() / 1000) + (config.deadline * 60),
        config,
      };

      const result = await createSwapMutation.mutateAsync({
        chainType,
        request: swapRequest,
      });

      onSwap?.(quote);
      
      toast({
        title: "Swap Submitted",
        description: `Intent ID: ${result.intentId}`,
      });
    } catch (error) {
      console.error('Swap failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Swap Tokens</CardTitle>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-shield-cyan" />
            <span className="text-sm font-medium">MEV Protection</span>
          </div>
          <Switch 
            checked={mevProtection}
            onCheckedChange={setMevProtection}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="text-muted-foreground">Balance: 0.00</span>
          </div>
            <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="text-lg h-12"
                disabled={!isConnected}
              />
            </div>
            <TokenSelector
              selectedToken={inputToken}
              onTokenSelect={setInputToken}
              chainType={chainType}
              label="Select Token"
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full border border-border/50"
            onClick={swapTokenPositions}
            disabled={!isConnected}
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="text-muted-foreground">Balance: 0.00</span>
          </div>
            <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="0.0"
                value={outputAmount}
                className="text-lg h-12"
                readOnly
                disabled={!isConnected}
              />
            </div>
            <TokenSelector
              selectedToken={outputToken}
              onTokenSelect={setOutputToken}
              chainType={chainType}
              label="Select Token"
              disabled={!isConnected}
            />
          </div>
        </div>

        {/* Quote Display */}
        <SwapQuoteDisplay 
          quote={quote}
          isLoading={isLoadingQuote}
          mevProtection={mevProtection}
        />

        {/* MEV Protection Info */}
        {mevProtection && (
          <div className="p-3 rounded-lg bg-shield-cyan/5 border border-shield-cyan/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-shield-cyan" />
              <span className="text-sm font-medium text-shield-cyan">MEV Protection Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your swap will use commit-reveal protocol to prevent front-running and MEV attacks.
            </p>
          </div>
        )}

        <Button 
          variant={mevProtection ? "shield" : "cosmic"} 
          className="w-full h-12 text-base font-semibold"
          disabled={!isConnected || !inputToken || !outputToken || !inputAmount || isLoadingQuote || createSwapMutation.isPending}
          onClick={handleSwap}
        >
          {!isConnected ? (
            "Connect Wallet"
          ) : !inputToken || !outputToken ? (
            "Select Tokens"
          ) : !inputAmount ? (
            "Enter Amount"
          ) : isLoadingQuote ? (
            "Getting Quote..."
          ) : createSwapMutation.isPending ? (
            "Creating Swap..."
          ) : mevProtection ? (
            <>
              <Shield className="w-4 h-4" />
              Protected Swap
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Instant Swap
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};