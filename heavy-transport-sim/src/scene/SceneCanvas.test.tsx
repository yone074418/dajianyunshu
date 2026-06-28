import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="scene-canvas" {...props}>
      {children}
    </div>
  ),
  useThree: () => ({
    camera: {
      position: { set: vi.fn(), x: 0, y: 1.7, z: 8 },
      lookAt: vi.fn(),
    },
  }),
  useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
  Html: ({ children }: React.PropsWithChildren) => (
    <div data-testid="scene-loading-html">{children}</div>
  ),
  Grid: () => <div data-testid="grid" />,
  OrbitControls: () => <div data-testid="orbit-controls" />,
}))

vi.mock('@react-three/rapier', () => ({
  Physics: ({ children }: React.PropsWithChildren) => (
    <div data-testid="physics-world">{children}</div>
  ),
  RigidBody: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid={props['data-testid'] ?? 'rigidbody'}>{children}</div>
  ),
  CuboidCollider: () => <div data-testid="cuboid-collider" />,
}))

vi.mock('./PlaceholderModels', () => ({
  default: () => <div data-testid="placeholder-models" />,
}))

vi.mock('./SceneInfoPanel', () => ({
  default: () => <div data-testid="scene-info-panel" />,
}))

vi.mock('./TriggerEventPanel', () => ({
  default: () => <div data-testid="trigger-event-panel" />,
}))

vi.mock('./SceneWalkthroughHelp', () => ({
  default: () => <div data-testid="walkthrough-help" />,
}))

import SceneCanvas from './SceneCanvas'
import { useSceneViewMode } from './useSceneViewMode'

describe('SceneCanvas', () => {
  beforeEach(() => {
    useSceneViewMode.setState({ mode: 'observe' })
  })

  it('should render canvas container', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('should render without crashing', () => {
    const { container } = render(<SceneCanvas />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render mode toggle', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('scene-mode-toggle')).toBeInTheDocument()
  })

  it('should show observe mode by default', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('mode-indicator')).toHaveTextContent('观察模式')
  })

  it('should show enter walkthrough button in observe mode', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('mode-toggle-btn')).toHaveTextContent('进入漫游')
  })

  it('should switch to walkthrough mode on button click', () => {
    render(<SceneCanvas />)
    fireEvent.click(screen.getByTestId('mode-toggle-btn'))
    expect(screen.getByTestId('mode-indicator')).toHaveTextContent('漫游模式')
    expect(screen.getByTestId('mode-toggle-btn')).toHaveTextContent('退出漫游')
  })

  it('should switch back to observe mode on second click', () => {
    render(<SceneCanvas />)
    fireEvent.click(screen.getByTestId('mode-toggle-btn'))
    fireEvent.click(screen.getByTestId('mode-toggle-btn'))
    expect(screen.getByTestId('mode-indicator')).toHaveTextContent('观察模式')
    expect(screen.getByTestId('mode-toggle-btn')).toHaveTextContent('进入漫游')
  })

  it('should show orbit controls in observe mode', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
  })

  it('should not show orbit controls in walkthrough mode', () => {
    render(<SceneCanvas />)
    fireEvent.click(screen.getByTestId('mode-toggle-btn'))
    expect(screen.queryByTestId('orbit-controls')).not.toBeInTheDocument()
  })
})
