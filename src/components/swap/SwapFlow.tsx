import { useState, useEffect } from 'react';
import { ChainType, Token, SwapQuote } from '@/types';
import { SwapForm } from './SwapForm';
import { SwapPreview } from './SwapPreview';
import { SwapCommitReveal } from './SwapCommitReveal';
import { SwapProgressTracker } from '@/components/ui/swap-progress-tracker';
import { SwapSuccessAnimation, StatusIndicator } from '@/components/ui/enhanced-animations';
import { ErrorBoundary, NetworkStatus, LoadingOverlay } from '@/components/ui/error-boundary';
import { SkeletonSwapForm } from '@/components/ui/skeleton-components';
import { useSwapStore } from '@/store/swap';
import { useSwapSession } from '@/hooks/useSwapSession';
import { useCreateSwap } from '@/hooks/useApi';
import { useWalletStore } from '@/store/wallet';
import { useAppStore } from '@/store/app';
import { toast } from '@/hooks/use-toast';

interface SwapFlowProps {
  chainType: ChainType;
  tokens: Token[];
  isConnected: boolean;
}

export const SwapFlow = ({ chainType, tokens, isConnected }: SwapFlowProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [completedSwap, setCompletedSwap] = useState<{ from: any; to: any } | null>(null);
  
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
  const { setLoading, incrementSwapCount, recordChainUsage, settings } = useAppStore();
  const { session, startSession, recoverSession, clearSession, revealSwap } = useSwapSession(chainType);
  const createSwapMutation = useCreateSwap();

  // Try to recover session on mount and track chain usage
  useEffect(() => {
    if (isConnected) {
      recoverSession();
      recordChainUsage(chainType);
    }
  }, [isConnected, recoverSession, recordChainUsage, chainType]);

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
      setLoading(true, 'Creating swap intent...');

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
        setLoading(true, 'Securing your swap with MEV protection...');
        startSession(swapIntent);
        setShowPreview(false);
        
        toast({
          title: "Swap Committed",
          description: "Your swap is protected. You can reveal when ready.",
        });
        
        // Track successful commit
        incrementSwapCount();
      } else {
        // Direct swap execution
        toast({
          title: "Swap Submitted",
          description: `Intent ID: ${result.intentId}`,
        });
        
        // Show success animation for instant swaps
        setCompletedSwap({
          from: { symbol: inputToken.symbol, amount: inputAmount },
          to: { symbol: outputToken.symbol, amount: quote.outputAmount }
        });
        setShowSuccessAnimation(true);
        
        // Track successful swap
        incrementSwapCount();
        
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
      setLoading(false);
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

  // Handle success animation completion
  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false);
    setCompletedSwap(null);
    resetSwap();
  };

  // Enhanced reveal with success tracking
  const handleReveal = async () => {
    if (!session.swapIntent) return;
    
    setLoading(true, 'Executing your protected swap...');
    
    try {
      await revealSwap();
      
      // Show success animation
      if (inputToken && outputToken) {
        setCompletedSwap({
          from: { symbol: inputToken.symbol, amount: inputAmount },
          to: { symbol: outputToken.symbol, amount: session.swapIntent.outputAmount }
        });
        setShowSuccessAnimation(true);
      }
      
      incrementSwapCount();
    } catch (error) {
      console.error('Reveal failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <NetworkStatus />
        
        {/* Success Animation */}
        {showSuccessAnimation && completedSwap && (
          <SwapSuccessAnimation
            fromToken={completedSwap.from}
            toToken={completedSwap.to}
            onComplete={handleSuccessComplete}
          />
        )}

        {/* Show active session if exists */}
        {!showSuccessAnimation && session.phase !== 'idle' && session.swapIntent && (
          <>
            <SwapProgressTracker
              swapIntent={session.swapIntent}
              currentPhase={session.phase === 'commit' ? 'commit' : session.phase === 'reveal' ? 'reveal' : 'execute'}
              mevProtection={session.swapIntent.config.mevProtection}
            />
            
            <SwapCommitReveal
              swapIntent={session.swapIntent}
              onReveal={handleReveal}
              onCancel={handleCommitRevealCancel}
              timeRemaining={session.timeRemaining}
            />
          </>
        )}

        {/* Show preview if requested */}
        {!showSuccessAnimation && !session.swapIntent && showPreview && quote && inputToken && outputToken && (
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
        )}

        {/* Show main swap form */}
        {!showSuccessAnimation && !session.swapIntent && !showPreview && (
          <>
            {!isConnected ? (
              <SkeletonSwapForm />
            ) : (
              <SwapForm
                chainType={chainType}
                tokens={tokens}
                onSwap={handleSwapInitiated}
                isConnected={isConnected}
              />
            )}
          </>
        )}

        {/* Loading States */}
        {createSwapMutation.isPending && (
          <StatusIndicator
            status="loading"
            message="Creating swap..."
          />
        )}

        {/* Global Loading Overlay */}
        <LoadingOverlay
          isLoading={false} // Controlled by app store
          message="Processing your request..."
        />
      </div>
    </ErrorBoundary>
  );
};