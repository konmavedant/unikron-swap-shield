import { apiClient } from '@/lib/api-client';
import { TokenListResponse, QuoteResponse } from '@/types/api';

export class UnikronApiService {
  /**
   * Get supported tokens (from backend)
   */
  static async getTokens(): Promise<TokenListResponse[]> {
    return apiClient.get('/tokens');
  }

  /**
   * Get swap quote (from backend, GET request with query params)
   */
  static async getQuote(fromToken: string, toToken: string, amount: string): Promise<QuoteResponse> {
    // Always send addresses in lowercase to match backend config
    return apiClient.get('/quote', {
      fromToken: fromToken.toLowerCase(),
      toToken: toToken.toLowerCase(),
      amount
    });
  }

  /**
   * Commit a swap (commit-reveal pattern)
   */
  static async commitSwap(hash: string): Promise<{ status: string; txHash: string }> {
    return apiClient.post('/swap/commit', { hash });
  }

  /**
   * Reveal a swap
   */
  static async revealSwap(params: {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    nonce: string;
    permitV?: number;
    permitR?: string;
    permitS?: string;
  }): Promise<{ status: string; txHash: string }> {
    return apiClient.post('/swap/reveal', params);
  }

  /**
   * Get swap status by tx hash
   */
  static async getSwapStatus(txHash: string): Promise<{ status: string; receipt?: any }> {
    return apiClient.get('/swap/status', { txHash });
  }

  /**
   * Get deployed tokens from contract (optional)
   */
  static async getDeployedTokens(): Promise<{ tokens: string[] }> {
    return apiClient.get('/deployed-tokens');
  }
}

export const {
  getTokens,
  getQuote,
  commitSwap,
  revealSwap,
  getSwapStatus,
  getDeployedTokens,
} = UnikronApiService;