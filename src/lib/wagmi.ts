import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, arbitrum, optimism, base } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'UNIKRON',
  projectId: 'fbab23fe8f44215275d52c133d358ab3', // Updated WalletConnect projectId
  chains: [mainnet, polygon, arbitrum, optimism, base],
  ssr: false,
});

export const supportedEvmChains = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
  { id: 10, name: 'Optimism', symbol: 'ETH' },
  { id: 8453, name: 'Base', symbol: 'ETH' },
];