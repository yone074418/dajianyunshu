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

vi.mock('./PlaceholderModels', () => ({
  default: () => <div data-testid="placeholder-models" />,
}))

vi.mock('./SceneInfoPanel', () => ({
  default: () => <div data-testid="scene-info-panel" />,
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
})
