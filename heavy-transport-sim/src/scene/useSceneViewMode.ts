import { create } from 'zustand'

export type SceneViewMode = 'observe' | 'walkthrough'

interface SceneViewModeState {
  mode: SceneViewMode
  enterWalkthrough: () => void
  exitWalkthrough: () => void
  toggle: () => void
}

export const useSceneViewMode = create<SceneViewModeState>((set) => ({
  mode: 'observe',
  enterWalkthrough: () => set({ mode: 'walkthrough' }),
  exitWalkthrough: () => set({ mode: 'observe' }),
  toggle: () =>
    set((state) => ({
      mode: state.mode === 'observe' ? 'walkthrough' : 'observe',
    })),
}))
