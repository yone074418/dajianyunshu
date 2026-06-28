import { describe, it, expect } from 'vitest'
import { useSceneInteraction } from './useSceneInteraction'
import { renderHook, act } from '@testing-library/react'

describe('useSceneInteraction', () => {
  it('should start with no hovered or selected object', () => {
    const { result } = renderHook(() => useSceneInteraction())
    expect(result.current.hoveredObjectId).toBeNull()
    expect(result.current.selectedObjectId).toBeNull()
  })

  it('should set hoveredObjectId on pointer over', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handlePointerOver('cargo-main'))
    expect(result.current.hoveredObjectId).toBe('cargo-main')
  })

  it('should clear hoveredObjectId on pointer out', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handlePointerOver('cargo-main'))
    act(() => result.current.handlePointerOut())
    expect(result.current.hoveredObjectId).toBeNull()
  })

  it('should set selectedObjectId on click', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handleClick('cargo-main'))
    expect(result.current.selectedObjectId).toBe('cargo-main')
  })

  it('should deselect when clicking same object', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handleClick('cargo-main'))
    act(() => result.current.handleClick('cargo-main'))
    expect(result.current.selectedObjectId).toBeNull()
  })

  it('should switch selected when clicking different object', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handleClick('cargo-main'))
    act(() => result.current.handleClick('tractor-6x6'))
    expect(result.current.selectedObjectId).toBe('tractor-6x6')
  })

  it('should not clear selected when hovering', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handleClick('cargo-main'))
    act(() => result.current.handlePointerOver('tractor-6x6'))
    expect(result.current.selectedObjectId).toBe('cargo-main')
    expect(result.current.hoveredObjectId).toBe('tractor-6x6')
  })

  it('should clear selection', () => {
    const { result } = renderHook(() => useSceneInteraction())
    act(() => result.current.handleClick('cargo-main'))
    act(() => result.current.clearSelection())
    expect(result.current.selectedObjectId).toBeNull()
  })
})
