import { useState, useEffect } from 'react';
import { ChainType, Token, SwapQuote } from '@/types';
import { SwapForm } from './SwapForm';
import { SwapPreview } from './SwapPreview';
import { SwapCommitReveal } from './SwapCommitReveal';
import { useSwapStore } from '@/store/swap';
import { useSwapSession } from '@/hooks/useSwapSession';
import { useCreateSwap } from '@/hooks/useApi';
import { useWalletStore } from '@/store/wallet';
import { toast } from '@/hooks/use-toast';

interface SwapFlowProps {
  chainType: ChainType;
  tokens: Token[];
  isConnected: boolean;
}

export const SwapFlow = ({ chainType, tokens, isConnected }: SwapFlowProps) => {
  const [showPreview, setShowPreview] = useState(false);
  
  const {
    inputToken,
    outputToken,
    inputAmount,
    quote,
    config,
    setSwapping,
    resetSwap
  } = useSwapStore();

  const { address } = useWalletStore();
  const { session, startSession, recoverSession, clearSession, revealSwap } = useSwapSession(chainType);
  const createSwapMutation = useCreateSwap();

  // Try to recover session on mount
  useEffect(() => {
    if (isConnected) {
      recoverSession();
    }
  }, [isConnected, recoverSession]);

  // Handle swap initiation from form
  const handleSwapInitiated = (swapQuote: SwapQuote) => {
    if (config.mevProtection) {
      setShowPreview(true);
    } else {
      // Direct swap without preview for non-MEV protected swaps
      executeSwap();
    }
  };

  // Execute the swap (commit phase for MEV protection)
  const executeSwap = async () => {
    if (!quote || !inputToken || !outputToken || !address) return;

    try {
      setSwapping(true);

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

      // Create swap intent for session management
      const swapIntent = {
        intentId: result.intentId,
        status: 'pending' as const,
        txHash: undefined, // SwapResponse has 'tx' not 'txHash'
        createdAt: Date.now(),
        inputToken,
        outputToken,
        inputAmount,
        outputAmount: quote.outputAmount,
        config,
        chainType,
        user: address,
      };

      if (config.mevProtection) {
        // Start MEV protected session
        startSession(swapIntent);
        setShowPreview(false);
        
        toast({
          title: "Swap Committed",
          description: "Your swap is protected. You can reveal when ready.",
        });
      } else {
        // Direct swap execution
        toast({
          title: "Swap Submitted",
          description: `Intent ID: ${result.intentId}`,
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          resetSwap();
        }, 2000);
      }
    } catch (error) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setSwapping(false);
    }
  };

  // Handle preview confirmation
  const handlePreviewConfirm = () => {
    executeSwap();
  };

  // Handle preview cancellation
  const handlePreviewCancel = () => {
    setShowPreview(false);
  };

  // Handle commit-reveal cancellation
  const handleCommitRevealCancel = () => {
    clearSession();
    resetSwap();
  };

  // Show active session if exists
  if (session.phase !== 'idle' && session.swapIntent) {
    return (
      <SwapCommitReveal
        swapIntent={session.swapIntent}
        onReveal={revealSwap}
        onCancel={handleCommitRevealCancel}
        timeRemaining={session.timeRemaining}
      />
    );
  }

  // Show preview if requested
  if (showPreview && quote && inputToken && outputToken) {
    return (
      <SwapPreview
        quote={quote}
        inputToken={inputToken}
        outputToken={outputToken}
        inputAmount={inputAmount}
        config={config}
        onConfirm={handlePreviewConfirm}
        onCancel={handlePreviewCancel}
        isCommitting={createSwapMutation.isPending}
        mevProtection={config.mevProtection}
      />
    );
  }

  // Show main swap form
  return (
    <SwapForm
      chainType={chainType}
      tokens={tokens}
      onSwap={handleSwapInitiated}
      isConnected={isConnected}
    />
  );
};