import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ApiException } from '@/types/api';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  errorCode?: string;
  errorDetails?: any;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: unknown) => void;
  clearError: () => void;
  retryWithHandler: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    error: null,
  });

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught by handler:', error);

    let errorMessage = 'An unexpected error occurred';
    let errorCode: string | undefined;
    let errorDetails: any;

    if (error instanceof ApiException) {
      errorMessage = error.message;
      errorCode = error.code;
      errorDetails = error.details;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Set error state
    setError({
      hasError: true,
      error: errorMessage,
      errorCode,
      errorDetails,
    });

    // Show toast notification
    toast({
      variant: 'destructive',
      title: 'Error',
      description: errorMessage,
    });
  }, []);

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      error: null,
    });
  }, []);

  const retryWithHandler = useCallback(async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      clearError();
      return await fn();
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryWithHandler,
  };
};