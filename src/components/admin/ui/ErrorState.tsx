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
  title = 'Xatolik yuz berdi',
  message = "Kutilmagan xatolik. Iltimos, qayta urinib ko'ring.",
  onRetry,
  onGoHome,
  className = '',
  variant = 'default',
}) => {
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20 ${className}`}>
        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-destructive">{title}</p>
          <p className="text-[11px] text-muted-foreground">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Qayta urinish
          </button>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`min-h-[60vh] flex items-center justify-center p-6 ${className}`}>
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">{title}</h2>
            <p className="text-xs text-muted-foreground">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            {onRetry && (
              <ActionButton onClick={onRetry} icon={<RotateCcw className="w-3.5 h-3.5" />} size="sm">
                Qayta urinish
              </ActionButton>
            )}
            {onGoHome && (
              <ActionButton variant="secondary" onClick={onGoHome} icon={<Home className="w-3.5 h-3.5" />} size="sm">
                Bosh sahifa
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-12 px-6 text-center ${className}`}>
      <div className="mx-auto w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-destructive" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground mb-4">{message}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
        {onRetry && (
          <ActionButton onClick={onRetry} icon={<RotateCcw className="w-3.5 h-3.5" />} size="sm">
            Qayta urinish
          </ActionButton>
        )}
        {onGoHome && (
          <ActionButton variant="secondary" onClick={onGoHome} icon={<Home className="w-3.5 h-3.5" />} size="sm">
            Bosh sahifa
          </ActionButton>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
