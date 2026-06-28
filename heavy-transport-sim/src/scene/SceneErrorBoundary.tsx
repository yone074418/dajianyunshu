import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onRetry?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Scene error:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          data-testid="scene-error"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '300px',
            gap: '16px',
            padding: '24px',
            background: '#fafafa',
            borderRadius: '8px',
          }}
        >
          <p style={{ color: '#c00', margin: 0, fontWeight: 'bold' }}>
            三维场景加载失败
          </p>
          <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>
            请检查网络或稍后重试
          </p>
          <button
            onClick={this.handleRetry}
            data-testid="scene-retry-button"
            style={{
              padding: '8px 24px',
              border: '1px solid #3d85c6',
              borderRadius: '4px',
              background: '#fff',
              color: '#3d85c6',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
