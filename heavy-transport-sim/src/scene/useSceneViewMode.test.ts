import { describe, it, expect, beforeEach } from 'vitest'
import { useSceneViewMode } from './useSceneViewMode'

describe('useSceneViewMode', () => {
  beforeEach(() => {
    useSceneViewMode.setState({ mode: 'observe' })
  })

  it('should default to observe mode', () => {
    expect(useSceneViewMode.getState().mode).toBe('observe')
  })

  it('should switch to walkthrough mode', () => {
    useSceneViewMode.getState().enterWalkthrough()
    expect(useSceneViewMode.getState().mode).toBe('walkthrough')
  })

  it('should switch back to observe mode', () => {
    useSceneViewMode.getState().enterWalkthrough()
    useSceneViewMode.getState().exitWalkthrough()
    expect(useSceneViewMode.getState().mode).toBe('observe')
  })

  it('should toggle from observe to walkthrough', () => {
    useSceneViewMode.getState().toggle()
    expect(useSceneViewMode.getState().mode).toBe('walkthrough')
  })

  it('should toggle from walkthrough to observe', () => {
    useSceneViewMode.getState().enterWalkthrough()
    useSceneViewMode.getState().toggle()
    expect(useSceneViewMode.getState().mode).toBe('observe')
  })
})
