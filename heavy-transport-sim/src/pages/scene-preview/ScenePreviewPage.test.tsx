import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
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

vi.mock('../../scene/PlaceholderModels', () => ({
  default: () => <div data-testid="placeholder-models" />,
}))

vi.mock('../../scene/SceneInfoPanel', () => ({
  default: () => <div data-testid="scene-info-panel" />,
}))

import ScenePreviewPage from './ScenePreviewPage'

describe('ScenePreviewPage', () => {
  it('should render page title', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByText('场景预览')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<ScenePreviewPage />)
    expect(
      screen.getByText(/Day38 模型交互底座/),
    ).toBeInTheDocument()
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
})
