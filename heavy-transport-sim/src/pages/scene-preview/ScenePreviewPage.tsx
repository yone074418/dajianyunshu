import { useState, useCallback } from 'react'
import { SceneCanvas } from '../../scene'

export default function ScenePreviewPage() {
  const [stepId, setStepId] = useState(1)

  const handleSwitchStep = useCallback((newStep: number) => {
    setStepId(newStep)
  }, [])

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>场景预览</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Day40-Day41 三维底座验证 — 支持观察/漫游切换、键盘移动、安全边界、步骤切换、场景卸载和资源清理。
      </p>
      <div
        style={{
          marginBottom: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
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
        <span style={{ fontSize: '13px', color: '#888', marginLeft: '8px' }}>
          步骤切换：
        </span>
        {[1, 2, 3, 4, 5].map((step) => (
          <button
            key={step}
            data-testid={`step-${step}`}
            onClick={() => handleSwitchStep(step)}
            style={{
              padding: '6px 16px',
              border: `1px solid ${stepId === step ? '#3d85c6' : '#ccc'}`,
              borderRadius: '4px',
              background: stepId === step ? '#3d85c6' : '#fff',
              color: stepId === step ? '#fff' : '#333',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            步骤 {step}
          </button>
        ))}
        <span
          data-testid="current-step"
          style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}
        >
          当前步骤: {stepId}
        </span>
      </div>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <SceneCanvas key={`step-${stepId}`} sceneKey={`step-${stepId}`} />
      </div>
    </div>
  )
}
