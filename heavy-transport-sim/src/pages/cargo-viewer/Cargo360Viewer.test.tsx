import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div data-testid="cargo-canvas" {...props}>
      {children}
    </div>
  ),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Html: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}))

import Cargo360Viewer from './Cargo360Viewer'

describe('Cargo360Viewer', () => {
  it('should render the viewer', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-360-viewer')).toBeInTheDocument()
  })

  it('should render canvas', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-canvas')).toBeInTheDocument()
  })

  it('should display cargo name from case data', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByText('500kV 大型电力变压器')).toBeInTheDocument()
  })

  it('should display cargo category', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByText('电力变压器')).toBeInTheDocument()
  })

  it('should display cargo length from case data', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-length')).toHaveTextContent('8.8')
  })

  it('should display cargo width from case data', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-width')).toHaveTextContent('3.4')
  })

  it('should display cargo height from case data', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-height')).toHaveTextContent('4.2')
  })

  it('should display cargo weight from case data', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-weight')).toHaveTextContent('168')
  })

  it('should display unit in dimensions table', () => {
    render(<Cargo360Viewer />)
    const dims = screen.getByTestId('cargo-dimensions')
    expect(dims).toHaveTextContent('m')
  })

  it('should display reset button', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('reset-view-btn')).toBeInTheDocument()
    expect(screen.getByText('复位视角')).toBeInTheDocument()
  })

  it('should have orbit controls for rotation', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument()
  })

  it('should display dimensions table', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByTestId('cargo-dimensions')).toBeInTheDocument()
    expect(screen.getByText('长度')).toBeInTheDocument()
    expect(screen.getByText('宽度')).toBeInTheDocument()
    expect(screen.getByText('高度')).toBeInTheDocument()
    expect(screen.getByText('重量')).toBeInTheDocument()
  })

  it('should display viewer help text', () => {
    render(<Cargo360Viewer />)
    expect(screen.getByText(/拖拽可旋转查看货物/)).toBeInTheDocument()
  })
})

describe('Cargo360Viewer data source', () => {
  it('should render data from case, not hardcoded', () => {
    render(<Cargo360Viewer />)
    const viewer = screen.getByTestId('cargo-360-viewer')
    expect(viewer).toHaveTextContent('8.8')
    expect(viewer).toHaveTextContent('3.4')
    expect(viewer).toHaveTextContent('4.2')
    expect(viewer).toHaveTextContent('168')
  })
})
