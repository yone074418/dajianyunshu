import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSceneCleanup } from './useSceneCleanup'

describe('useSceneCleanup', () => {
  it('should not call cleanup on initial mount', () => {
    const onCleanup = vi.fn()
    renderHook(({ key }) => useSceneCleanup(key, onCleanup), {
      initialProps: { key: 'step-1' },
    })
    expect(onCleanup).not.toHaveBeenCalled()
  })

  it('should call cleanup when sceneKey changes', () => {
    const onCleanup = vi.fn()
    const { rerender } = renderHook(
      ({ key }) => useSceneCleanup(key, onCleanup),
      { initialProps: { key: 'step-1' } },
    )
    rerender({ key: 'step-2' })
    expect(onCleanup).toHaveBeenCalledTimes(1)
  })

  it('should not call cleanup when sceneKey stays the same', () => {
    const onCleanup = vi.fn()
    const { rerender } = renderHook(
      ({ key }) => useSceneCleanup(key, onCleanup),
      { initialProps: { key: 'step-1' } },
    )
    rerender({ key: 'step-1' })
    expect(onCleanup).not.toHaveBeenCalled()
  })

  it('should call cleanup on unmount', () => {
    const onCleanup = vi.fn()
    const { unmount } = renderHook(() => useSceneCleanup('step-1', onCleanup))
    unmount()
    expect(onCleanup).toHaveBeenCalledTimes(1)
  })

  it('should call cleanup each time key changes', () => {
    const onCleanup = vi.fn()
    const { rerender } = renderHook(
      ({ key }) => useSceneCleanup(key, onCleanup),
      { initialProps: { key: 'step-1' } },
    )
    rerender({ key: 'step-2' })
    rerender({ key: 'step-3' })
    rerender({ key: 'step-4' })
    expect(onCleanup).toHaveBeenCalledTimes(3)
  })
})
