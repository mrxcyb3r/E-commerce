import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TrendBadgeProps {
  value: number; // percentage change, can be negative
  suffix?: string;
  invert?: boolean; // for metrics where down is good
  className?: string;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ value, suffix = '%', invert, className }) => {
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-black px-1.5 py-0.5 rounded-md ${
        good
          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40'
          : 'text-rose-600 dark:text-rose-400 bg-rose-100/70 dark:bg-rose-950/40'
      } ${className ?? ''}`}
    >
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
};
