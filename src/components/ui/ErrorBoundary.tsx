import React, { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  onError?: (error: Error, info: string) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  info?: string;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
  fallback,
  onError,
}) => {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
  });

  useEffect(() => {
    if (state.hasError) {
      onError?.(state.error!, state.info ?? 'unknown');
    }
  }, [state.hasError, onError]);

  const handleError = (error: Error, info: string) => {
    setState({ hasError: true, error, info });
    onError?.(error, info);
  };

  const handleRetry = () => {
    setState({ hasError: false });
  };

  if (state.hasError) {
    return fallback;
  }

  return null;
};

ErrorBoundary.unsafeHandleError = handleError;