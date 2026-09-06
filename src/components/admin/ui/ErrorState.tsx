import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { ActionButton } from './PageHeader';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  variant?: 'default' | 'inline' | 'full';
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onGoHome,
  className = '',
  variant = 'default',
}) => {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 ${className}`}>
        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <ActionButton variant="ghost" onClick={onRetry} icon={<RotateCcw className="w-3.5 h-3.5" />} className="px-3 py-1.5 text-xs">
            Retry
          </ActionButton>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center p-6 ${className}`}>
        <div className="text-center space-y-6 max-w-md">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-xl mb-2">{title}</h2>
            <p className="text-muted-foreground">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {onRetry && (
              <ActionButton onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
                Try Again
              </ActionButton>
            )}
            {onGoHome && (
              <ActionButton variant="secondary" onClick={onGoHome} icon={<Home className="w-4 h-4" />}>
                Go Home
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-8 text-center ${className}`}>
      <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="font-display font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRetry && (
          <ActionButton onClick={onRetry} icon={<RotateCcw className="w-4 h-4" />}>
            Retry
          </ActionButton>
        )}
        {onGoHome && (
          <ActionButton variant="secondary" onClick={onGoHome} icon={<Home className="w-4 h-4" />}>
            Go Home
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default ErrorState;