import { create } from 'zustand'

export const experimentSteps = [
  'task-introduction',
  'vehicle-selection',
  'route-survey',
  'vehicle-adjustment',
  'loading',
  'lashing',
  'transport',
  'result',
] as const

export type ExperimentStep = (typeof experimentSteps)[number]

type ExperimentSessionSnapshot = {
  currentStep: ExperimentStep
  currentStepIndex: number
  completedSteps: ExperimentStep[]
  canGoNext: boolean
  canGoPrevious: boolean
}

type ExperimentSessionActions = {
  goNext: () => void
  goPrevious: () => void
  goToStep: (step: ExperimentStep) => void
  markStepCompleted: (step: ExperimentStep) => void
  resetSession: () => void
}

type ExperimentSessionState = ExperimentSessionSnapshot &
  ExperimentSessionActions

const getStepSnapshot = (
  currentStep: ExperimentStep,
): Pick<
  ExperimentSessionSnapshot,
  'currentStep' | 'currentStepIndex' | 'canGoNext' | 'canGoPrevious'
> => {
  const currentStepIndex = experimentSteps.indexOf(currentStep)

  return {
    currentStep,
    currentStepIndex,
    canGoNext: currentStepIndex < experimentSteps.length - 1,
    canGoPrevious: currentStepIndex > 0,
  }
}

const initialSnapshot: ExperimentSessionSnapshot = {
  ...getStepSnapshot('task-introduction'),
  completedSteps: [],
}

export const useExperimentSessionStore = create<ExperimentSessionState>(
  (set, get) => ({
    ...initialSnapshot,
    goNext: () => {
      const { currentStepIndex } = get()
      const nextStep =
        experimentSteps[
          Math.min(currentStepIndex + 1, experimentSteps.length - 1)
        ]

      set(getStepSnapshot(nextStep))
    },
    goPrevious: () => {
      const { currentStepIndex } = get()
      const previousStep = experimentSteps[Math.max(currentStepIndex - 1, 0)]

      set(getStepSnapshot(previousStep))
    },
    goToStep: (step) => {
      set(getStepSnapshot(step))
    },
    markStepCompleted: (step) => {
      const { completedSteps } = get()

      if (completedSteps.includes(step)) {
        return
      }

      set({ completedSteps: [...completedSteps, step] })
    },
    resetSession: () => {
      set(initialSnapshot)
    },
  }),
)
