import { useEffect, useCallback } from 'react';
import { useSwapStore } from '@/store/swap';
import { UnikronApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { validateAmount } from '@/utils/validation';
import { AppError, ErrorType, ErrorSeverity } from '@/types/errors';
import { APP_CONFIG } from '@/constants/app';

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
  const { handleError, retryWithHandler, isRetrying } = useErrorHandler();
  const { measureAsync } = usePerformanceMonitor();
  const debouncedInputAmount = useDebounce(inputAmount, APP_CONFIG.DEBOUNCE_DELAY);

  const fetchQuote = useCallback(async () => {
    if (!inputToken || !outputToken || !debouncedInputAmount || parseFloat(debouncedInputAmount) === 0) {
      setQuote(null);
      return;
    }

    // Validate input amount
    try {
      validateAmount(debouncedInputAmount);
    } catch (error) {
      handleError(error);
      return;
    }

    setLoadingQuote(true);
    setError(null);

    try {
      // Always pass addresses as strings
      const newQuote = await measureAsync(
        'fetchQuote',
        () => UnikronApiService.getQuote(
          inputToken.address,
          outputToken.address,
          debouncedInputAmount
        ),
        { inputAmount: debouncedInputAmount }
      );
      setQuote(newQuote);
    } catch (error) {
      console.error('Failed to fetch quote:', error);
      const appError = error instanceof Error 
        ? new AppError({
            type: ErrorType.API_ERROR,
            severity: ErrorSeverity.HIGH,
            message: error.message.includes('network') ? 'Network error while fetching quote' : 'Failed to fetch quote',
            retry: true,
            metadata: { inputAmount: debouncedInputAmount }
          })
        : new AppError({
            type: ErrorType.UNKNOWN_ERROR,
            severity: ErrorSeverity.MEDIUM,
            message: 'Failed to fetch quote',
            retry: true,
          });
      handleError(appError);
      setError(appError.message);
    } finally {
      setLoadingQuote(false);
    }
  }, [inputToken, outputToken, debouncedInputAmount, config, setQuote, setLoadingQuote, setError, handleError, measureAsync]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const refreshQuote = useCallback(() => {
    retryWithHandler(fetchQuote);
  }, [fetchQuote, retryWithHandler]);

  const hasValidInputs = !!(inputToken && outputToken && debouncedInputAmount && parseFloat(debouncedInputAmount) > 0);

  return {
    quote,
    isLoadingQuote: isLoadingQuote || isRetrying,
    refreshQuote,
    hasValidInputs,
    isRetrying,
  };
};