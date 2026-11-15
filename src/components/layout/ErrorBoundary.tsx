/**
 * ErrorBoundary Component
 *
 * React error boundary that catches JavaScript errors in child component tree,
 * logs them, and displays a fallback UI.
 *
 * Task: T054
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component for graceful error handling
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToErrorService(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1 className="error-boundary__title">¡Uy!</h1>
            <p className="error-boundary__message">
              Algo salió mal. ¡Vamos a intentarlo otra vez!
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Detalles del error</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
            <button
              className="error-boundary__button"
              onClick={this.handleReset}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
