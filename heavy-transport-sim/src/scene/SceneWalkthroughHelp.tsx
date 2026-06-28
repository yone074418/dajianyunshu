import { useSceneViewMode } from './useSceneViewMode'

export default function SceneWalkthroughHelp() {
  const mode = useSceneViewMode((s) => s.mode)

  if (mode !== 'walkthrough') return null

  return (
    <div
      data-testid="walkthrough-help"
      style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '6px',
        fontSize: '12px',
        lineHeight: '1.8',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <div>W / ↑ 前进</div>
      <div>S / ↓ 后退</div>
      <div>A / ← 左移</div>
      <div>D / → 右移</div>
      <div>Esc 退出漫游</div>
    </div>
  )
}
