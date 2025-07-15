import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UnikronApiService } from '@/services/api';
import { ChainType, Token } from '@/types';
import { 
  QuoteRequest, 
  QuoteResponse, 
  SwapRequest, 
  SwapResponse,
  SwapStatusResponse,
  SwapHistoryItem,
  ApiException 
} from '@/types/api';
import { toast } from '@/hooks/use-toast';

// Query Keys
export const queryKeys = {
  tokens: (chainType: ChainType) => ['tokens', chainType],
  quote: (chainType: ChainType, request: QuoteRequest) => ['quote', chainType, request],
  swapStatus: (chainType: ChainType, intentId: string) => ['swapStatus', chainType, intentId],
  swapHistory: (chainType: ChainType, userAddress: string) => ['swapHistory', chainType, userAddress],
};

/**
 * Hook to fetch supported tokens for a chain
 */
export function useTokens(chainType: ChainType) {
  return useQuery({
    queryKey: queryKeys.tokens(chainType),
    queryFn: () => UnikronApiService.getTokens(chainType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook to get swap quote with debouncing
 */
export function useSwapQuote(
  chainType: ChainType,
  request: QuoteRequest | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: request ? queryKeys.quote(chainType, request) : ['quote', 'disabled'],
    queryFn: () => {
      if (!request) throw new Error('Quote request is required');
      return UnikronApiService.getQuote(chainType, request);
    },
    enabled: enabled && !!request,
    staleTime: 30 * 1000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof ApiException && error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to create swap intent
 */
export function useCreateSwap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chainType, request }: { 
      chainType: ChainType; 
      request: SwapRequest 
    }) => UnikronApiService.createSwap(chainType, request),
    
    onSuccess: (data: SwapResponse, variables) => {
      toast({
        title: "Swap Initiated",
        description: `Intent created: ${data.intentId}`,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['swapHistory', variables.chainType]
      });
    },
    
    onError: (error: ApiException) => {
      toast({
        title: "Swap Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to track swap status
 */
export function useSwapStatus(
  chainType: ChainType,
  intentId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: intentId ? queryKeys.swapStatus(chainType, intentId) : ['swapStatus', 'disabled'],
    queryFn: () => {
      if (!intentId) throw new Error('Intent ID is required');
      return UnikronApiService.getSwapStatus(chainType, intentId);
    },
    enabled: enabled && !!intentId,
    refetchInterval: (query) => {
      // Stop polling if swap is completed
      if (query.state.data && ['executed', 'expired', 'cancelled'].includes(query.state.data.status)) {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
    retry: 3,
  });
}

/**
 * Hook to fetch user swap history
 */
export function useSwapHistory(
  chainType: ChainType,
  userAddress: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: userAddress ? queryKeys.swapHistory(chainType, userAddress) : ['swapHistory', 'disabled'],
    queryFn: () => {
      if (!userAddress) throw new Error('User address is required');
      return UnikronApiService.getSwapHistory(chainType, userAddress);
    },
    enabled: enabled && !!userAddress,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook for polling swap with automatic completion detection
 */
export function usePollSwap(
  chainType: ChainType,
  intentId: string | null,
  onComplete?: (result: SwapStatusResponse) => void,
  onError?: (error: Error) => void
) {
  return useMutation({
    mutationFn: () => {
      if (!intentId) throw new Error('Intent ID is required');
      return UnikronApiService.pollSwapStatus(chainType, intentId);
    },
    
    onSuccess: (data: SwapStatusResponse) => {
      if (data.status === 'executed') {
        toast({
          title: "Swap Completed",
          description: `Transaction: ${data.txHash}`,
        });
      } else if (data.status === 'expired') {
        toast({
          title: "Swap Expired",
          description: "The swap intent has expired",
          variant: "destructive",
        });
      } else if (data.status === 'cancelled') {
        toast({
          title: "Swap Cancelled",
          description: "The swap was cancelled",
          variant: "destructive",
        });
      }
      
      onComplete?.(data);
    },
    
    onError: (error: Error) => {
      toast({
        title: "Swap Monitoring Failed",
        description: error.message,
        variant: "destructive",
      });
      
      onError?.(error);
    },
  });
}