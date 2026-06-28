import type { SceneObjectMeta } from './sceneObjectMeta'

interface SceneInfoPanelProps {
  meta: SceneObjectMeta | null
  isHovered: boolean
}

export default function SceneInfoPanel({
  meta,
  isHovered,
}: SceneInfoPanelProps) {
  if (!meta) return null

  return (
    <div
      data-testid="scene-info-panel"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '240px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '13px',
        lineHeight: '1.5',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '15px',
          marginBottom: '8px',
          color: '#333',
        }}
      >
        {meta.name}
      </div>
      <div
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          background: '#e8f0fe',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#3d85c6',
          marginBottom: '8px',
        }}
      >
        {meta.category}
      </div>
      <div style={{ color: '#555', marginBottom: '8px' }}>
        {meta.description}
      </div>
      <div
        style={{
          padding: '8px',
          background: '#fff3cd',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#856404',
        }}
      >
        {meta.teachingTip}
      </div>
      {isHovered && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#999' }}>
          点击选中此对象
        </div>
      )}
    </div>
  )
}
