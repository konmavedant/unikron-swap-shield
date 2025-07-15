import { create } from 'zustand';
import { WalletState, ChainType } from '@/types';

interface WalletStore extends WalletState {
  setWallet: (wallet: Partial<WalletState>) => void;
  connect: (address: string, chainType: ChainType, chainId?: number) => void;
  disconnect: () => void;
  setConnecting: (connecting: boolean) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  chainType: null,
  chainId: undefined,
  isConnected: false,
  isConnecting: false,

  setWallet: (wallet) =>
    set((state) => ({ ...state, ...wallet })),

  connect: (address, chainType, chainId) =>
    set({
      address,
      chainType,
      chainId,
      isConnected: true,
      isConnecting: false,
    }),

  disconnect: () =>
    set({
      address: null,
      chainType: null,
      chainId: undefined,
      isConnected: false,
      isConnecting: false,
    }),

  setConnecting: (isConnecting) =>
    set({ isConnecting }),
}));