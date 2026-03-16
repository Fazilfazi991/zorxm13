
import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, color: 'red', backgroundColor: '#fff', minHeight: '100vh' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}><strong>Oops! Something went wrong.</strong></h2>
          <p style={{ marginBottom: '8px' }}>The AI Generator encountered a runtime error:</p>
          <div style={{ border: '1px solid #ff0000', padding: '16px', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
            <strong>Error:</strong> {this.state.error.message}
            <pre style={{ marginTop: '16px', fontSize: '12px', overflow: 'auto', maxHeight: '300px' }}>
              {this.state.error.stack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginTop: '24px', 
              padding: '12px 24px', 
              backgroundColor: '#166534', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
