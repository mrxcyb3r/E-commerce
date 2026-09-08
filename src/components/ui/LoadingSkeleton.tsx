import React from 'react';

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'grid' | 'avatar';
  className?: string;
  width?: string;
  height?: string;
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'grid',
  className = '',
  width,
  height,
  count = 8,
}) => {
  const shimmer = 'animate-shimmer bg-zinc-100/50 dark:bg-zinc-800/50';

  const variants = {
    text: 'h-3.5 w-full text-zinc-200 dark:bg-zinc-800/50',
    card: 'h-48 w-full rounded-xl border border-zinc-200/30 dark:border-border/30',
    grid: 'h-48 w-full rounded-xl border border-zinc-200/30 dark:border-border/30',
    avatar: 'w-16 h-16 rounded-full border border-zinc-200/30 dark:border-border/30',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`rounded-shimmer ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  ));

  return <div className="space-y-2">{items}</div>;
};

export default LoadingSkeleton;