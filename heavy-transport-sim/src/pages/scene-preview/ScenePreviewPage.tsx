import { SceneCanvas } from '../../scene'

export default function ScenePreviewPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>场景预览</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Day38 模型交互底座 — 支持悬停、点选、高亮和教学提示。
      </p>
      <div style={{ marginBottom: '12px' }}>
        <button
          data-testid="reset-camera"
          style={{
            padding: '8px 20px',
            border: '1px solid #3d85c6',
            borderRadius: '4px',
            background: '#fff',
            color: '#3d85c6',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          重置视角
        </button>
      </div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <SceneCanvas />
      </div>
    </div>
  )
}
