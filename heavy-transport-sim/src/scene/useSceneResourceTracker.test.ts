import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSceneResourceTracker } from './useSceneResourceTracker'

describe('useSceneResourceTracker', () => {
  it('should start with zero counts', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    expect(result.current.getCounts()).toEqual({
      geometries: 0,
      materials: 0,
      textures: 0,
      listeners: 0,
    })
  })

  it('should track geometry', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => result.current.trackGeometry())
    act(() => result.current.trackGeometry())
    expect(result.current.getCounts().geometries).toBe(2)
  })

  it('should track material', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => result.current.trackMaterial())
    expect(result.current.getCounts().materials).toBe(1)
  })

  it('should track texture', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => result.current.trackTexture())
    expect(result.current.getCounts().textures).toBe(1)
  })

  it('should track and untrack listeners', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => result.current.trackListener())
    act(() => result.current.trackListener())
    expect(result.current.getCounts().listeners).toBe(2)
    act(() => result.current.untrackListener())
    expect(result.current.getCounts().listeners).toBe(1)
  })

  it('should not go below zero when untracking', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => result.current.untrackListener())
    expect(result.current.getCounts().listeners).toBe(0)
  })

  it('should reset counts', () => {
    const { result } = renderHook(() => useSceneResourceTracker())
    act(() => {
      result.current.trackGeometry()
      result.current.trackMaterial()
      result.current.trackTexture()
      result.current.trackListener()
    })
    act(() => result.current.resetCounts())
    expect(result.current.getCounts()).toEqual({
      geometries: 0,
      materials: 0,
      textures: 0,
      listeners: 0,
    })
  })
})
