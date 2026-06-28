import { useState, useCallback } from 'react'
import { SceneCanvas } from '../../scene'

export default function ScenePreviewPage() {
  const [cameraResetKey, setCameraResetKey] = useState(0)

  const handleResetCamera = useCallback(() => {
    setCameraResetKey((k) => k + 1)
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>场景预览</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Day37 相机控制底座 — 支持旋转、缩放、重置和边界限制。
      </p>
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={handleResetCamera}
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
        <SceneCanvas cameraResetKey={cameraResetKey} />
      </div>
    </div>
  )
}
