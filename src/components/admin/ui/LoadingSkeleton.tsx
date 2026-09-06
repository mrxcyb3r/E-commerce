import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'button' | 'image';
  className?: string;
  width?: string;
  height?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  className = '',
  width,
  height,
  count = 1,
}) => {
  const baseClass = 'shimmer rounded';

  const variants = {
    text: 'h-3.5 w-full',
    card: 'h-48 w-full rounded-xl',
    table: 'h-10 w-full',
    avatar: 'w-8 h-8 rounded-full',
    button: 'h-9 w-20 rounded-lg',
    image: 'aspect-video w-full rounded-xl',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClass} ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  ));

  return <div className="space-y-2">{items}</div>;
};

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns = 5,
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`admin-section overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full" role="grid" aria-label="Loading table">
          <thead>
            <tr className="border-b border-border">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-2.5 text-left">
                  <div className="shimmer h-3 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/50">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-2.5">
                    <div className="shimmer h-3.5 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface CardGridSkeletonProps {
  count?: number;
  columns?: { base: number; sm: number; lg: number; xl: number };
  className?: string;
}

export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({
  count = 8,
  columns = { base: 1, sm: 2, lg: 4, xl: 5 },
  className = '',
}) => {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns.base}, minmax(0, 1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-section overflow-hidden p-0">
          <div className="aspect-square shimmer" />
          <div className="p-3 space-y-2">
            <div className="shimmer h-3 w-3/4" />
            <div className="shimmer h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
