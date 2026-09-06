import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  illustration?: 'search' | 'folder' | 'chart' | 'users' | 'box' | 'document';
}

const illustrations = {
  search: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M44 44L54 54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <path d="M8 20h48a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 20V16a4 4 0 0 1 4-4h24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <path d="M8 56v-40h48" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 48l8-16 8 8 8-12 8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <circle cx="32" cy="24" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 56c0-13.255 10.745-24 24-24s24 10.745 24 24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <path d="M8 24l16-8 16 8 16-8 16 8v24l-16 8-16-8-16 8-16-8V24z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 16v24M40 16v24" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 text-muted-foreground/40" aria-hidden="true">
      <path d="M8 8h36a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 24h32M16 32h24M16 40h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  illustration,
}) => {
  const illustrationIcon = illustration ? illustrations[illustration] : null;

  return (
    <div className={`py-16 px-6 text-center ${className}`}>
      <div className="mx-auto mb-4">
        {icon || illustrationIcon || illustrations.box}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
};

export const EmptyStateWithAction: React.FC<{
  illustration?: EmptyStateProps['illustration'];
  title: string;
  description: string;
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
}> = ({ illustration, title, description, primaryAction, secondaryAction }) => {
  return (
    <EmptyState
      illustration={illustration}
      title={title}
      description={description}
      action={primaryAction}
      secondaryAction={secondaryAction}
    />
  );
};

export default EmptyState;
