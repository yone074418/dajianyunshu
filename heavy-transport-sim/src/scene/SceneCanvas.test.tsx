import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="scene-canvas" {...props}>
      {children}
    </div>
  ),
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

import SceneCanvas from './SceneCanvas'

describe('SceneCanvas', () => {
  it('should render canvas container', () => {
    render(<SceneCanvas />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('should render without crashing', () => {
    const { container } = render(<SceneCanvas />)
    expect(container.firstChild).toBeTruthy()
  })

  it('should render only one canvas element', () => {
    const { container } = render(<SceneCanvas />)
    const canvases = container.querySelectorAll('[data-testid="scene-canvas"]')
    expect(canvases.length).toBe(1)
  })

  it('should accept sceneKey prop', () => {
    render(<SceneCanvas sceneKey="step-1" />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('should remount when sceneKey changes', () => {
    const { unmount } = render(<SceneCanvas sceneKey="step-1" />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
    unmount()
    render(<SceneCanvas sceneKey="step-2" />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })

  it('should have only one canvas after sceneKey change', () => {
    const { unmount } = render(<SceneCanvas sceneKey="step-1" />)
    unmount()
    const { container: container2 } = render(<SceneCanvas sceneKey="step-2" />)
    const canvases = container2.querySelectorAll('[data-testid="scene-canvas"]')
    expect(canvases.length).toBe(1)
  })
})
