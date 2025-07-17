import { RetryConfig } from '@/types/errors';

export const APP_CONFIG = {
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second base delay
  
  // Performance Configuration
  DEBOUNCE_DELAY: 500,
  QUOTE_REFRESH_INTERVAL: 15000, // 15 seconds
  VIRTUAL_LIST_ITEM_HEIGHT: 80,
  VIRTUAL_LIST_OVERSCAN: 5,
  
  // Security Configuration
  MAX_INPUT_LENGTH: 100,
  MAX_DECIMAL_PLACES: 18,
  RATE_LIMIT_REQUESTS: 10,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  
  // Validation Rules
  MIN_SWAP_AMOUNT: 0.000001,
  MAX_SLIPPAGE: 50, // 50%
  MIN_SLIPPAGE: 0.1, // 0.1%
  
  // Monitoring
  ERROR_REPORT_THRESHOLD: ErrorSeverity.MEDIUM,
  PERFORMANCE_SAMPLE_RATE: 0.1, // 10% sampling
} as const;

export const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export const SUPPORTED_NETWORKS = {
  EVM: ['ethereum', 'polygon', 'bsc', 'arbitrum'],
  SOLANA: ['mainnet-beta', 'devnet'],
} as const;

export const ERROR_MESSAGES = {
  NETWORK_UNAVAILABLE: 'Network is currently unavailable. Please try again.',
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue.',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  SLIPPAGE_TOO_HIGH: 'Slippage tolerance is too high.',
  RATE_LIMITED: 'Too many requests. Please wait a moment.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  QUOTE_EXPIRED: 'Quote has expired. Getting a new quote...',
} as const;

import { ErrorSeverity } from '@/types/errors';

export const UNIKRON_AGGREGATOR_ADDRESS = '0x1a3655e14e8c5736ffac297dfd1fc324f90eedde';
export const UNIKRON_AGGREGATOR_ABI = [
  {
    "inputs": [],
    "name": "getDeployedTokens",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const DUMMY_TOKENS = [
  { name: 'Dummy Ethereum', symbol: 'ETH-D', address: '0x014c66bFe06949F45304B23bD7CbFFCFD845bC42' },
  { name: 'Dummy Tether', symbol: 'USDT-D', address: '0x947092F0eEF063FF8db69D3eDe4994927772DfA8' },
  { name: 'Dai Stablecoin', symbol: 'DAI-D', address: '0x19894273C95e4e7aA96f8500fe50cB8aE8A6991C' },
  { name: 'Uniswap Dummy', symbol: 'UNI-D', address: '0xe6DD30e98D3C591Ec55C04a24e2b98ab52F764A9' },
  { name: 'Chainlink Dummy', symbol: 'LINK-D', address: '0xDBb66CA34B8A08441Be493aC305b0bdFCa4169cD' },
  { name: 'Aave Dummy', symbol: 'AAVE-D', address: '0xBC1e9AC6015C1295Af3e1987c664Cd052e3C38B7' },
  { name: 'Polygon Dummy', symbol: 'MATIC-D', address: '0x524B569aF737F977BdaaEC42dD24e74f0916033c' },
  { name: 'BND Dummy', symbol: 'BNB-D', address: '0x1d5AFD87B505b2BEf6aAbe987b461Ab56D5a8834' },
  { name: 'Solana Dummy', symbol: 'SOL-D', address: '0xa9E2D3fA8476C7873fb7424bd9BA2a301BCD119c' },
];