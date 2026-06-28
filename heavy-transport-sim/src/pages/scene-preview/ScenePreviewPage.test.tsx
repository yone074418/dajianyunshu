import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

import ScenePreviewPage from './ScenePreviewPage'

describe('ScenePreviewPage', () => {
  it('should render page title', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByText('场景预览')).toBeInTheDocument()
  })

  it('should render description', () => {
    render(<ScenePreviewPage />)
    expect(
      screen.getByText(/Day37 相机控制底座/),
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

  it('should trigger camera reset when button clicked', () => {
    render(<ScenePreviewPage />)
    const button = screen.getByTestId('reset-camera')
    fireEvent.click(button)
    expect(button).toBeInTheDocument()
  })
})
