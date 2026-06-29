import { create } from 'zustand'
import type { VehicleCombination } from '../domain/vehicleCombinations'

export type AnimationStatus = 'idle' | 'playing' | 'paused' | 'completed'

export interface CombinationSelectionState {
  selectedCombinationId: string | null
  animationStatus: AnimationStatus
  currentStepIndex: number
  selectedCombination: VehicleCombination | null
  selectCombination: (combination: VehicleCombination) => void
  clearSelection: () => void
  play: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  advanceStep: () => void
  setAnimationStatus: (status: AnimationStatus) => void
}

export const useCombinationSelectionStore = create<CombinationSelectionState>(
  (set) => ({
    selectedCombinationId: null,
    animationStatus: 'idle',
    currentStepIndex: 0,
    selectedCombination: null,

    selectCombination: (combination) =>
      set({
        selectedCombinationId: combination.id,
        selectedCombination: combination,
        animationStatus: 'idle',
        currentStepIndex: 0,
      }),

    clearSelection: () =>
      set({
        selectedCombinationId: null,
        selectedCombination: null,
        animationStatus: 'idle',
        currentStepIndex: 0,
      }),

    play: () => set({ animationStatus: 'playing', currentStepIndex: 0 }),

    pause: () => set({ animationStatus: 'paused' }),

    resume: () => set({ animationStatus: 'playing' }),

    reset: () => set({ animationStatus: 'idle', currentStepIndex: 0 }),

    advanceStep: () =>
      set((state) => {
        const steps = state.selectedCombination?.demoConfig.animationSteps
        if (!steps) return state
        const nextIndex = state.currentStepIndex + 1
        if (nextIndex >= steps.length) {
          return { currentStepIndex: nextIndex, animationStatus: 'completed' }
        }
        return { currentStepIndex: nextIndex }
      }),

    setAnimationStatus: (status) => set({ animationStatus: status }),
  }),
)
