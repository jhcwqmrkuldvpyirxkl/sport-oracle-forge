import { create } from "zustand";

/**
 * Bet slip state interface
 * Manages user selections and encryption status for placing bets
 */
type BetSlipState = {
  /** Currently selected market ID */
  selectedMarketId?: bigint;
  /** Selected outcome index (0, 1, 2 etc.) */
  selectedOutcome?: number;
  /** Stake amount in ETH as string */
  stakeEther: string;
  /** Whether FHE encryption is in progress */
  isEncrypting: boolean;

  /** Set the selected market */
  setSelectedMarket: (marketId?: bigint) => void;
  /** Set the selected outcome */
  setSelectedOutcome: (outcome?: number) => void;
  /** Set the stake amount */
  setStakeEther: (value: string) => void;
  /** Set encryption loading state */
  setEncrypting: (value: boolean) => void;
  /** Reset all state to initial values */
  reset: () => void;
};

/**
 * Bet slip store using Zustand
 * Manages the state of the betting form
 */
export const useBetSlipStore = create<BetSlipState>((set) => ({
  selectedMarketId: undefined,
  selectedOutcome: undefined,
  stakeEther: "",
  isEncrypting: false,

  setSelectedMarket: (marketId) => set({ selectedMarketId: marketId }),
  setSelectedOutcome: (outcome) => set({ selectedOutcome: outcome }),
  setStakeEther: (value) => set({ stakeEther: value }),
  setEncrypting: (value) => set({ isEncrypting: value }),

  reset: () =>
    set({
      selectedMarketId: undefined,
      selectedOutcome: undefined,
      stakeEther: "",
      isEncrypting: false
    })
}));
