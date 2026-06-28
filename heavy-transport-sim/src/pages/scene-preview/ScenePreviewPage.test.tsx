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
      screen.getByText(/Day36 三维场景底座预览/),
    ).toBeInTheDocument()
  })

  it('should render scene canvas', () => {
    render(<ScenePreviewPage />)
    expect(screen.getByTestId('scene-canvas')).toBeInTheDocument()
  })
})
