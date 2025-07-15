import { Token } from './index';

// API Request/Response Types
export interface TokenListResponse {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  chainId?: number; // EVM only
}

export interface QuoteRequest {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  slippage: number;
  user: string;
}

export interface QuoteResponse {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  fee: string;
  route: string[];
  estimatedGas?: string; // EVM only
  slippage: number;
  minOutputAmount: string;
}

export interface SwapRequest {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  minOutputAmount: string;
  slippage: number;
  user: string;
  deadline: number;
  signature?: string;
}

export interface SwapResponse {
  tx: string; // EVM: raw tx data; Solana: base64 tx
  intentId: string;
  status: string;
}

export interface SwapStatusResponse {
  intentId: string;
  status: 'pending' | 'committed' | 'executed' | 'expired' | 'cancelled';
  txHash?: string;
  createdAt: number;
  executedAt?: number;
}

export interface SwapHistoryItem extends SwapStatusResponse {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export class ApiException extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiException';
  }
}