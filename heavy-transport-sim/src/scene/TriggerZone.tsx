import { CuboidCollider } from '@react-three/rapier'
import type { SceneTriggerEventType } from './triggerTypes'

interface TriggerZoneProps {
  id: string
  name: string
  position?: [number, number, number]
  halfExtents?: [number, number, number]
  onTriggerEvent: (
    triggerId: string,
    triggerName: string,
    objectId: string,
    eventType: SceneTriggerEventType,
  ) => void
}

export default function TriggerZone({
  id,
  name,
  position = [4, 1, 0],
  halfExtents = [1, 1, 1],
  onTriggerEvent,
}: TriggerZoneProps) {
  return (
    <CuboidCollider
      args={halfExtents}
      position={position}
      sensor
      onIntersectionEnter={(other) => {
        const objectId = other.rigidBodyObject?.name ?? 'unknown'
        onTriggerEvent(id, name, objectId, 'trigger_enter')
      }}
      onIntersectionExit={(other) => {
        const objectId = other.rigidBodyObject?.name ?? 'unknown'
        onTriggerEvent(id, name, objectId, 'trigger_exit')
      }}
    />
  )
}
