export type SceneTriggerEventType =
  | 'trigger_enter'
  | 'trigger_exit'

export interface SceneTriggerEvent {
  id: string
  triggerId: string
  triggerName: string
  objectId: string
  eventType: SceneTriggerEventType
  timestamp: string
}
