import React, { ReactNode, useState, useEffect, useCallback } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  onError?: (error: Error, info: string) => void;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.props.onError?.(error, info.componentStack ?? 'unknown');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, info: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-black tracking-tight">
              Something went wrong
            </div>
            <p className="text-sm text-muted-foreground">
              An error occurred while loading this page.
            </p>
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children ?? null;
  }
}

export default ErrorBoundary;