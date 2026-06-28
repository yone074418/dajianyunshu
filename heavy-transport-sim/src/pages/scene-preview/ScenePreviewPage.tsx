import { SceneCanvas } from '../../scene'

export default function ScenePreviewPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>场景预览</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Day36 三维场景底座预览 — 包含基础 Canvas、灯光和地面。
      </p>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          marginTop: '16px',
        }}
      >
        <SceneCanvas />
      </div>
    </div>
  )
}
