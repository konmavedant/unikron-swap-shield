import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UnikronApiService } from '@/services/api';
import { ChainType, Token, TokenWithMetadata } from '@/types';
import { useWalletStore } from '@/store/wallet';

// Hook for fetching and managing token data
export function useTokenData(chainType: ChainType) {
  const { address, isConnected } = useWalletStore();

  // Fetch token list
  const {
    data: tokens = [],
    isLoading: isLoadingTokens,
    error: tokensError,
  } = useQuery({
    queryKey: ['tokens', chainType],
    queryFn: () => UnikronApiService.getTokens(chainType),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });

  // Fetch token prices (optional)
  const tokenAddresses = useMemo(() => 
    tokens.slice(0, 50).map(token => token.address), // Limit to top 50 for performance
    [tokens]
  );

  const {
    data: tokenPrices,
    isLoading: isLoadingPrices,
  } = useQuery({
    queryKey: ['tokenPrices', chainType, tokenAddresses],
    queryFn: () => {
      if (tokenAddresses.length === 0) return {};
      // This would be implemented when price API is available
      return Promise.resolve({});
    },
    enabled: tokenAddresses.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Combine tokens with price data
  const tokensWithMetadata = useMemo((): TokenWithMetadata[] => {
    return tokens.map(token => ({
      ...token,
      priceUSD: tokenPrices?.[token.address]?.price || 0,
      priceChange24h: tokenPrices?.[token.address]?.priceChange24h || 0,
      volume24h: tokenPrices?.[token.address]?.volume24h || 0,
      marketCap: tokenPrices?.[token.address]?.marketCap || 0,
      verified: token.verified ?? true, // Assume verified if not specified
      isPopular: isPopularToken(token.symbol),
    }));
  }, [tokens, tokenPrices]);

  // Popular tokens (hardcoded for now, could come from API)
  const popularTokens = useMemo(() => 
    tokensWithMetadata.filter(token => token.isPopular),
    [tokensWithMetadata]
  );

  // Recent tokens from localStorage
  const recentTokens = useMemo(() => {
    try {
      const stored = localStorage.getItem(`recentTokens_${chainType}_${address}`);
      if (!stored) return [];
      
      const recentAddresses = JSON.parse(stored) as string[];
      return tokensWithMetadata.filter(token => 
        recentAddresses.includes(token.address)
      ).slice(0, 5);
    } catch {
      return [];
    }
  }, [tokensWithMetadata, chainType, address]);

  // Save recent token selection
  const addRecentToken = (token: Token) => {
    if (!address) return;
    
    try {
      const key = `recentTokens_${chainType}_${address}`;
      const stored = localStorage.getItem(key);
      const existing = stored ? JSON.parse(stored) : [];
      
      // Add to front, remove duplicates, limit to 10
      const updated = [
        token.address,
        ...existing.filter((addr: string) => addr !== token.address)
      ].slice(0, 10);
      
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent token:', error);
    }
  };

  return {
    tokens: tokensWithMetadata,
    popularTokens,
    recentTokens: isConnected ? recentTokens : [],
    isLoading: isLoadingTokens,
    isLoadingPrices,
    error: tokensError,
    addRecentToken,
  };
}

// Helper function to determine if a token is popular
function isPopularToken(symbol: string): boolean {
  const popularSymbols = [
    // EVM
    'ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'UNI', 'LINK', 'AAVE', 'COMP',
    // Solana  
    'SOL', 'USDC', 'USDT', 'RAY', 'SRM', 'FIDA', 'STEP', 'COPE', 'MEDIA', 'ROPE',
  ];
  
  return popularSymbols.includes(symbol.toUpperCase());
}