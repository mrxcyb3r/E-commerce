import React from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  iconBg?: string;
  href?: string;
  loading?: boolean;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg = 'bg-muted',
  href,
  loading = false,
  className = '',
}) => {
  const Component = href ? 'a' : 'div';

  const trendColor = trend?.isPositive
    ? 'text-emerald-600 dark:text-emerald-400'
    : 'text-red-600 dark:text-red-400';

  if (loading) {
    return (
      <div className={`admin-section ${className}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="shimmer h-3 w-2/3 rounded" />
            <div className="shimmer h-7 w-1/2 rounded" />
          </div>
          <div className="shimmer w-9 h-9 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`admin-section admin-surface-hover ${className}`}
    >
      <Component
        href={href}
        className="flex flex-col h-full"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-xl font-bold text-foreground mt-1 tabular-nums tracking-tight">
              {value}
            </p>
          </div>
          {icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
              {icon}
            </div>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="mt-auto pt-3 flex items-center gap-2">
            {subtitle && (
              <p className="text-[11px] text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-0.5 text-[11px] font-semibold ${trendColor}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        )}

        {href && (
          <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <span>View details</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        )}
      </Component>
    </motion.div>
  );
};

export default StatCard;
