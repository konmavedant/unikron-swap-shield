import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Token } from '@/types';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';

interface TokenBalance {
  token: Token;
  balance: string;
  usdValue?: number;
  isLoading: boolean;
  error?: string;
}

interface UseTokenBalanceProps {
  token: Token | null;
  enabled?: boolean;
}

const fetchTokenBalance = async (
  token: Token,
  userAddress: string
): Promise<{ balance: string; usdValue?: number }> => {
  try {
    // Use ethers.js to fetch ERC20 balance
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const abi = ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"];
    const contract = new ethers.Contract(token.address, abi, provider);
    const [rawBalance, decimals] = await Promise.all([
      contract.balanceOf(userAddress),
      contract.decimals()
    ]);
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    // Dummy USD value (replace with real price if available)
    const usdValue = parseFloat(balance) * (token.symbol === 'ETH' ? 3000 : 1);
    return { balance, usdValue };
  } catch (e) {
    return { balance: '0.0', usdValue: 0 };
  }
};

export const useTokenBalance = ({ token, enabled = true }: UseTokenBalanceProps): TokenBalance => {
  const { address: evmAddress } = useAccount();
  const userAddress = evmAddress;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tokenBalance', token?.address, userAddress],
    queryFn: () => fetchTokenBalance(token!, userAddress!),
    enabled: enabled && !!token && !!userAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  return {
    token: token!,
    balance: data?.balance || '0.0',
    usdValue: data?.usdValue,
    isLoading: isLoading && enabled,
    error: error?.message,
  };
};

// Hook for multiple token balances (EVM only)
export const useTokenBalances = (tokens: Token[]) => {
  const { address: evmAddress } = useAccount();
  const userAddress = evmAddress;

  const { data, isLoading, error } = useQuery({
    queryKey: ['tokenBalances', tokens.map(t => t.address), userAddress],
    queryFn: async () => {
      if (!userAddress) return [];
      const balances = await Promise.all(
        tokens.map(async (token) => {
          const result = await fetchTokenBalance(token, userAddress);
          return {
            token,
            ...result,
          };
        })
      );
      return balances;
    },
    enabled: !!userAddress && tokens.length > 0,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  return {
    balances: data || [],
    isLoading,
    error: error?.message,
  };
};