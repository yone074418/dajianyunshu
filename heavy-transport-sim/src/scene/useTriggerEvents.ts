import { useState, useCallback, useRef } from 'react'
import type { SceneTriggerEvent, SceneTriggerEventType } from './triggerTypes'

const MAX_EVENTS = 10

export function useTriggerEvents() {
  const [events, setEvents] = useState<SceneTriggerEvent[]>([])
  const lastEventKeyRef = useRef<string>('')

  const recordEvent = useCallback(
    (
      triggerId: string,
      triggerName: string,
      objectId: string,
      eventType: SceneTriggerEventType,
    ) => {
      const key = `${triggerId}:${objectId}:${eventType}`
      if (lastEventKeyRef.current === key) return
      lastEventKeyRef.current = key

      const event: SceneTriggerEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        triggerId,
        triggerName,
        objectId,
        eventType,
        timestamp: new Date().toISOString(),
      }

      setEvents((prev) => [event, ...prev].slice(0, MAX_EVENTS))
    },
    [],
  )

  const clearEvents = useCallback(() => {
    setEvents([])
    lastEventKeyRef.current = ''
  }, [])

  return { events, recordEvent, clearEvents }
}
