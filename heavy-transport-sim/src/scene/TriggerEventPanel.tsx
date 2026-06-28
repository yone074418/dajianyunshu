import type { SceneTriggerEvent } from './triggerTypes'

interface TriggerEventPanelProps {
  events: SceneTriggerEvent[]
}

export default function TriggerEventPanel({ events }: TriggerEventPanelProps) {
  if (events.length === 0) return null

  return (
    <div
      data-testid="trigger-event-panel"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        width: '280px',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '12px',
      }}
    >
      <div
        style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}
      >
        触发事件
      </div>
      {events.map((evt) => (
        <div
          key={evt.id}
          data-testid="trigger-event-item"
          style={{
            padding: '4px 0',
            borderBottom: '1px solid #eee',
            color: evt.eventType === 'trigger_enter' ? '#2d70b3' : '#999',
          }}
        >
          [{evt.eventType}] {evt.triggerName} ← {evt.objectId}
        </div>
      ))}
    </div>
  )
}
