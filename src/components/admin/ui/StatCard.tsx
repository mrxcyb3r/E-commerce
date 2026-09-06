import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, ExternalLink } from 'lucide-react';
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
  iconBg = 'bg-primary/10',
  href,
  loading = false,
  className = '',
}) => {
  const Component = href ? 'a' : 'div';

  const trendColor = trend?.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const trendIcon = trend?.isPositive ? ArrowUpRight : ArrowDownRight;
  const trendLabel = trend?.label || (trend?.isPositive ? 'vs last period' : 'vs last period');

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`card p-5 ${className}`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="shimmer h-3 w-3/4 rounded" />
            <div className="shimmer h-8 w-1/2 rounded" />
          </div>
          <div className="shimmer w-12 h-12 rounded-xl" />
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            <div className="shimmer h-3 w-24 rounded-full" />
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card p-5 transition-all hover:shadow-lg ${className}`}
    >
      <Component
        href={href}
        className="group flex flex-col h-full"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="font-display font-black text-foreground mt-1"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', lineHeight: '1.1' }}>
              {value}
            </p>
          </div>
          {icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg} group-hover:scale-105 transition-transform duration-300`}>
              {icon}
            </div>
          )}
        </div>

        {(subtitle || trend) && (
          <div className="mt-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-4 border-t border-border/50">
            {subtitle && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {subtitle}
              </p>
            )}

            {trend && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                {trend.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">{trendLabel}</span>
              </div>
            )}
          </div>
        )}

        {href && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground group-hover:text-accent transition-colors">
            <span>View details</span>
            <motion.div
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </motion.div>
          </div>
        )}
      </Component>
    </motion.div>
  );
};

export default StatCard;