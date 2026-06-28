import { describe, it, expect } from 'vitest'
import { shouldIgnoreKeyboardEvent } from './keyboardControlGuard'

function makeEvent(tagName: string, isContentEditable = false): KeyboardEvent {
  const target = document.createElement('div')
  Object.defineProperty(target, 'tagName', {
    value: tagName,
    configurable: true,
  })
  if (isContentEditable) {
    Object.defineProperty(target, 'isContentEditable', { value: true })
  }
  const event = new KeyboardEvent('keydown', { key: 'w' })
  Object.defineProperty(event, 'target', { value: target })
  return event
}

describe('shouldIgnoreKeyboardEvent', () => {
  it('should ignore events from input elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('INPUT'))).toBe(true)
  })

  it('should ignore events from textarea elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('TEXTAREA'))).toBe(true)
  })

  it('should ignore events from select elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('SELECT'))).toBe(true)
  })

  it('should ignore events from contenteditable elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('DIV', true))).toBe(true)
  })

  it('should not ignore events from regular div elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('DIV'))).toBe(false)
  })

  it('should not ignore events from button elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('BUTTON'))).toBe(false)
  })

  it('should not ignore events from span elements', () => {
    expect(shouldIgnoreKeyboardEvent(makeEvent('SPAN'))).toBe(false)
  })

  it('should handle null target gracefully', () => {
    const event = new KeyboardEvent('keydown', { key: 'w' })
    Object.defineProperty(event, 'target', { value: null })
    expect(shouldIgnoreKeyboardEvent(event)).toBe(false)
  })
})
