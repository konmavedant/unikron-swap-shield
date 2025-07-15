import { useEffect, useCallback } from 'react';
import { useSwapStore } from '@/store/swap';
import { UnikronApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

export const useSwapQuote = () => {
  const {
    chainType,
    inputToken,
    outputToken,
    inputAmount,
    quote,
    config,
    isLoadingQuote,
    setQuote,
    setLoadingQuote,
    setError
  } = useSwapStore();

  const { toast } = useToast();
  const debouncedInputAmount = useDebounce(inputAmount, 500);

  const fetchQuote = useCallback(async () => {
    if (!inputToken || !outputToken || !debouncedInputAmount || parseFloat(debouncedInputAmount) === 0) {
      setQuote(null);
      return;
    }

    setLoadingQuote(true);
    setError(null);

    try {
      const quoteRequest = {
        inputToken: inputToken.address,
        outputToken: outputToken.address,
        inputAmount: debouncedInputAmount,
        slippage: config.slippage,
        user: 'user-placeholder', // This should come from wallet connection
        config
      };

      const newQuote = await UnikronApiService.getQuote(chainType, quoteRequest);
      setQuote(newQuote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch quote');
      toast({
        title: "Quote Error",
        description: "Failed to get swap quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingQuote(false);
    }
  }, [
    chainType,
    inputToken,
    outputToken,
    debouncedInputAmount,
    config,
    setQuote,
    setLoadingQuote,
    setError,
    toast
  ]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const refreshQuote = useCallback(() => {
    fetchQuote();
  }, [fetchQuote]);

  return {
    quote,
    isLoadingQuote,
    refreshQuote,
    hasValidInputs: !!(inputToken && outputToken && debouncedInputAmount && parseFloat(debouncedInputAmount) > 0)
  };
};