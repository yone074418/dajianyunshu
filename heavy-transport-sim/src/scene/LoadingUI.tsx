import { Html } from '@react-three/drei'

export default function LoadingUI() {
  return (
    <Html center data-testid="scene-loading">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '24px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            border: '4px solid #e0e0e0',
            borderTop: '4px solid #3d85c6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '14px', color: '#333' }}>
          正在加载三维场景...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Html>
  )
}
