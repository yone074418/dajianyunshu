import { useSceneViewMode } from './useSceneViewMode'

export default function SceneModeToggle() {
  const mode = useSceneViewMode((s) => s.mode)
  const toggle = useSceneViewMode((s) => s.toggle)

  return (
    <div
      data-testid="scene-mode-toggle"
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10,
      }}
    >
      <button
        data-testid="mode-toggle-btn"
        onClick={toggle}
        style={{
          padding: '8px 20px',
          border: '1px solid #3d85c6',
          borderRadius: '4px',
          background: mode === 'walkthrough' ? '#d32f2f' : '#3d85c6',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          pointerEvents: 'auto',
        }}
      >
        {mode === 'observe' ? '进入漫游' : '退出漫游'}
      </button>
      <div
        data-testid="mode-indicator"
        style={{
          fontSize: '12px',
          color: '#555',
          background: 'rgba(255,255,255,0.9)',
          padding: '4px 8px',
          borderRadius: '4px',
          pointerEvents: 'none',
        }}
      >
        当前模式：{mode === 'observe' ? '观察模式' : '漫游模式'}
      </div>
    </div>
  )
}
