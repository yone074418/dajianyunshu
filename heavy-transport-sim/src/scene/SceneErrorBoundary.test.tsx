import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SceneErrorBoundary from './SceneErrorBoundary'

function ThrowingChild(): JSX.Element {
  throw new Error('Test scene error')
}

describe('SceneErrorBoundary', () => {
  it('should render children when no error', () => {
    render(
      <SceneErrorBoundary>
        <div data-testid="child">Content</div>
      </SceneErrorBoundary>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should show error fallback when child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SceneErrorBoundary>
        <ThrowingChild />
      </SceneErrorBoundary>,
    )

    expect(screen.getByTestId('scene-error')).toBeInTheDocument()
    expect(screen.getByText('三维场景加载失败')).toBeInTheDocument()
    expect(screen.getByText('请检查网络或稍后重试')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should show retry button on error', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SceneErrorBoundary>
        <ThrowingChild />
      </SceneErrorBoundary>,
    )

    expect(screen.getByTestId('scene-retry-button')).toBeInTheDocument()
    expect(screen.getByText('重试')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should call onRetry when retry button clicked', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRetry = vi.fn()

    render(
      <SceneErrorBoundary onRetry={onRetry}>
        <ThrowingChild />
      </SceneErrorBoundary>,
    )

    fireEvent.click(screen.getByTestId('scene-retry-button'))
    expect(onRetry).toHaveBeenCalled()

    consoleSpy.mockRestore()
  })

  it('should not show technical error details to user', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SceneErrorBoundary>
        <ThrowingChild />
      </SceneErrorBoundary>,
    )

    expect(screen.queryByText('Test scene error')).not.toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
