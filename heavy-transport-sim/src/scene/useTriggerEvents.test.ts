import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTriggerEvents } from './useTriggerEvents'

describe('useTriggerEvents', () => {
  it('should start with empty events', () => {
    const { result } = renderHook(() => useTriggerEvents())
    expect(result.current.events).toEqual([])
  })

  it('should record trigger enter event', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].triggerId).toBe('trigger-height-zone')
    expect(result.current.events[0].triggerName).toBe('限高检测区')
    expect(result.current.events[0].objectId).toBe('tractor-6x6')
    expect(result.current.events[0].eventType).toBe('trigger_enter')
  })

  it('should record trigger exit event', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_exit',
      ),
    )
    expect(result.current.events).toHaveLength(1)
    expect(result.current.events[0].eventType).toBe('trigger_exit')
  })

  it('should deduplicate consecutive same events', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    expect(result.current.events).toHaveLength(1)
  })

  it('should allow different event types for same trigger', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_exit',
      ),
    )
    expect(result.current.events).toHaveLength(2)
  })

  it('should limit events to MAX_EVENTS', () => {
    const { result } = renderHook(() => useTriggerEvents())
    for (let i = 0; i < 15; i++) {
      act(() =>
        result.current.recordEvent(
          `trigger-${i}`,
          `触发区${i}`,
          'obj',
          i % 2 === 0 ? 'trigger_enter' : 'trigger_exit',
        ),
      )
    }
    expect(result.current.events.length).toBeLessThanOrEqual(10)
  })

  it('should clear events', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    act(() => result.current.clearEvents())
    expect(result.current.events).toEqual([])
  })

  it('each event should have a timestamp', () => {
    const { result } = renderHook(() => useTriggerEvents())
    act(() =>
      result.current.recordEvent(
        'trigger-height-zone',
        '限高检测区',
        'tractor-6x6',
        'trigger_enter',
      ),
    )
    expect(result.current.events[0].timestamp).toBeTypeOf('string')
    expect(new Date(result.current.events[0].timestamp).getTime()).not.toBeNaN()
  })
})
