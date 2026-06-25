import { beforeEach, describe, expect, it } from 'vitest'
import {
  experimentSteps,
  useExperimentSessionStore,
} from './experimentSessionStore'

describe('experiment session store', () => {
  beforeEach(() => {
    useExperimentSessionStore.getState().resetSession()
  })

  it('starts at the task introduction step with no completed steps', () => {
    const state = useExperimentSessionStore.getState()

    expect(experimentSteps).toEqual([
      'task-introduction',
      'vehicle-selection',
      'route-survey',
      'vehicle-adjustment',
      'loading',
      'lashing',
      'transport',
      'result',
    ])
    expect(state.currentStep).toBe('task-introduction')
    expect(state.currentStepIndex).toBe(0)
    expect(state.completedSteps).toEqual([])
    expect(state.canGoPrevious).toBe(false)
    expect(state.canGoNext).toBe(true)
  })

  it('moves forward one step at a time', () => {
    useExperimentSessionStore.getState().goNext()

    const state = useExperimentSessionStore.getState()
    expect(state.currentStep).toBe('vehicle-selection')
    expect(state.currentStepIndex).toBe(1)
    expect(state.canGoPrevious).toBe(true)
    expect(state.canGoNext).toBe(true)
  })

  it('moves backward one step at a time', () => {
    useExperimentSessionStore.getState().goToStep('route-survey')
    useExperimentSessionStore.getState().goPrevious()

    const state = useExperimentSessionStore.getState()
    expect(state.currentStep).toBe('vehicle-selection')
    expect(state.currentStepIndex).toBe(1)
  })

  it('does not move before the first step or after the last step', () => {
    useExperimentSessionStore.getState().goPrevious()
    expect(useExperimentSessionStore.getState().currentStep).toBe(
      'task-introduction',
    )

    useExperimentSessionStore.getState().goToStep('result')
    useExperimentSessionStore.getState().goNext()

    const state = useExperimentSessionStore.getState()
    expect(state.currentStep).toBe('result')
    expect(state.currentStepIndex).toBe(experimentSteps.length - 1)
    expect(state.canGoNext).toBe(false)
    expect(state.canGoPrevious).toBe(true)
  })

  it('jumps to a legal experiment step', () => {
    useExperimentSessionStore.getState().goToStep('lashing')

    const state = useExperimentSessionStore.getState()
    expect(state.currentStep).toBe('lashing')
    expect(state.currentStepIndex).toBe(5)
  })

  it('records completed steps', () => {
    useExperimentSessionStore.getState().markStepCompleted('loading')

    expect(useExperimentSessionStore.getState().completedSteps).toEqual([
      'loading',
    ])
  })

  it('does not duplicate completed steps', () => {
    useExperimentSessionStore.getState().markStepCompleted('loading')
    useExperimentSessionStore.getState().markStepCompleted('loading')

    expect(useExperimentSessionStore.getState().completedSteps).toEqual([
      'loading',
    ])
  })

  it('resets navigation and completion state', () => {
    useExperimentSessionStore.getState().goToStep('transport')
    useExperimentSessionStore.getState().markStepCompleted('loading')

    useExperimentSessionStore.getState().resetSession()

    const state = useExperimentSessionStore.getState()
    expect(state.currentStep).toBe('task-introduction')
    expect(state.currentStepIndex).toBe(0)
    expect(state.completedSteps).toEqual([])
    expect(state.canGoPrevious).toBe(false)
    expect(state.canGoNext).toBe(true)
  })
})
