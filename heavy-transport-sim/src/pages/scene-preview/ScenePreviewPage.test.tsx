import { describe, it, expect, vi } from 'vitest'
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

vi.mock('../../scene/PlaceholderModels', () => ({
  default: () => <div data-testid="placeholder-models" />,
}))

vi.mock('../../scene/SceneInfoPanel', () => ({
  default: () => <div data-testid="scene-info-panel" />,
}))

vi.mock('../../scene/TriggerEventPanel', () => ({
  default: () => <div data-testid="trigger-event-panel" />,
}))

vi.mock('../../scene/SceneWalkthroughHelp', () => ({
  default: () => <div data-testid="walkthrough-help" />,
}))

import ScenePreviewPage from './ScenePreviewPage'

describe('ScenePreviewPage', () => {
  it('should render page title', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByText('场景预览')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByText(/Day40-Day41 三维底座验证/)).toBeInTheDocument()
  })

  it('should render scene canvas', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('should render reset camera button', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByTestId('reset-camera')).toBeInTheDocument()
    expect(screen.getByText('重置视角')).toBeInTheDocument()
  })

  it('should render step buttons', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByTestId('step-1')).toBeInTheDocument()
    expect(screen.getByTestId('step-2')).toBeInTheDocument()
    expect(screen.getByTestId('step-3')).toBeInTheDocument()
    expect(screen.getByTestId('step-4')).toBeInTheDocument()
    expect(screen.getByTestId('step-5')).toBeInTheDocument()
  })

  it('should show current step as 1 by default', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByTestId('current-step')).toHaveTextContent('当前步骤: 1')
  })

  it('should switch step on button click', () => {
    render(<ScenePreviewPage />)
    fireEvent.click(screen.getByTestId('step-3'))
    expect(screen.getByTestId('current-step')).toHaveTextContent('当前步骤: 3')
  })

  it('should still have only one canvas after step switch', () => {
    const { container } = render(<ScenePreviewPage />)
    fireEvent.click(screen.getByTestId('step-2'))
    const canvases = container.querySelectorAll('[data-testid="scene-canvas"]')
    expect(canvases.length).toBe(1)
  })
})
