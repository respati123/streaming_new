import type { ErrorBoundaryProps, ErrorBoundaryState } from '@shared/types/error-boundary.types';
import { Component, type ErrorInfo } from 'react';
import { RiAlertLine, RiRefreshLine } from 'react-icons/ri';
import { Button } from './Button';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          data-testid="error-boundary-fallback"
          className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-rose-50/40 border border-rose-200/80 rounded-2xl m-4 font-sans"
        >
          <div className="rounded-2xl bg-rose-100/80 p-4 text-rose-600 mb-4 border border-rose-200">
            <RiAlertLine className="text-3xl" />
          </div>

          <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">Broadcast Exception Occurred</h2>

          <p className="mt-2 text-xs text-zinc-600 max-w-md mx-auto leading-relaxed font-mono">
            {this.state.error?.message ||
              'An unexpected application runtime exception was captured. You can reset state or reload the console.'}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Button
              data-testid="error-boundary-retry-btn"
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              leftIcon={<RiRefreshLine className="text-sm" />}
            >
              Try Again
            </Button>
            <Button
              data-testid="error-boundary-reload-btn"
              variant="primary"
              size="sm"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
