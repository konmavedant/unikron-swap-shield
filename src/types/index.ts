export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  chainId?: number; // EVM only
  balance?: string;
}

export interface SwapQuote {
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

export interface Intent {
  intentId: string;
  status: 'pending' | 'committed' | 'executed' | 'expired' | 'cancelled';
  txHash?: string;
  createdAt: number;
  executedAt?: number;
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
}

export interface WalletState {
  address: string | null;
  chainType: 'evm' | 'solana' | null;
  chainId?: number; // EVM only
  isConnected: boolean;
  isConnecting: boolean;
}

export interface SwapState {
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  quote: SwapQuote | null;
  isLoadingQuote: boolean;
  isSwapping: boolean;
  slippage: number;
}

export type ChainType = 'evm' | 'solana';

export interface SwapRequest {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
  slippage: number;
  user: string;
}

export interface SwapResponse {
  tx: string;
  intentId: string;
  status: string;
}