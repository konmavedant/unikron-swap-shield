import { create } from 'zustand';
import { SwapState, Token, SwapQuote, ChainType } from '@/types';

interface SwapStore extends SwapState {
  setInputToken: (token: Token | null) => void;
  setOutputToken: (token: Token | null) => void;
  setInputAmount: (amount: string) => void;
  setOutputAmount: (amount: string) => void;
  setQuote: (quote: SwapQuote | null) => void;
  setLoadingQuote: (loading: boolean) => void;
  setSwapping: (swapping: boolean) => void;
  setSlippage: (slippage: number) => void;
  swapTokens: () => void;
  resetSwap: () => void;
  
  // Current active intent tracking
  activeIntentId: string | null;
  setActiveIntentId: (intentId: string | null) => void;
}

export const useSwapStore = create<SwapStore>((set, get) => ({
  // Initial state
  inputToken: null,
  outputToken: null,
  inputAmount: '',
  outputAmount: '',
  quote: null,
  isLoadingQuote: false,
  isSwapping: false,
  slippage: 0.5,
  activeIntentId: null,

  // Actions
  setInputToken: (token) => 
    set({ inputToken: token, quote: null }),

  setOutputToken: (token) => 
    set({ outputToken: token, quote: null }),

  setInputAmount: (amount) => 
    set({ inputAmount: amount, quote: null }),

  setOutputAmount: (amount) => 
    set({ outputAmount: amount }),

  setQuote: (quote) => {
    set({ 
      quote,
      outputAmount: quote?.outputAmount || '',
    });
  },

  setLoadingQuote: (isLoadingQuote) => 
    set({ isLoadingQuote }),

  setSwapping: (isSwapping) => 
    set({ isSwapping }),

  setSlippage: (slippage) => 
    set({ slippage, quote: null }),

  setActiveIntentId: (activeIntentId) => 
    set({ activeIntentId }),

  swapTokens: () => {
    const { inputToken, outputToken, inputAmount, outputAmount } = get();
    set({
      inputToken: outputToken,
      outputToken: inputToken,
      inputAmount: outputAmount,
      outputAmount: inputAmount,
      quote: null,
    });
  },

  resetSwap: () => 
    set({
      inputToken: null,
      outputToken: null,
      inputAmount: '',
      outputAmount: '',
      quote: null,
      isLoadingQuote: false,
      isSwapping: false,
      activeIntentId: null,
    }),
}));