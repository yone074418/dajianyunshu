import { SceneCanvas } from '../../scene'

export default function ScenePreviewPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>场景预览</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Day40 第一人称漫游模式 — 支持观察/漫游切换、键盘移动和安全边界。
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
