import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
  badge?: { label: string; count?: number };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  action,
  breadcrumb,
  badge,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-6 lg:mb-8"
    >
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" aria-hidden="true" />
              )}
              {item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display font-black tracking-tight text-foreground"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', lineHeight: '1.1' }}>
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-black uppercase tracking-widest border border-accent/20">
                {badge.label}
                {badge.count !== undefined && (
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center">
                    {badge.count}
                  </span>
                )}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-base font-medium">{subtitle}</p>
          )}
          {description && (
            <p className="text-muted-foreground/80 text-sm leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-2 sm:ml-auto shrink-0">
            {action}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive';
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const MotionLink = motion(Link);
const MotionButton = motion.button;

export const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  icon,
  disabled,
  className = '',
}) => {
  const isLink = !!href;
  const Component = isLink ? MotionLink : MotionButton;

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-muted',
    ghost: 'bg-transparent hover:bg-muted',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`;

  return (
    <Component
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      to={href}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      type={isLink ? undefined : 'button'}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </Component>
  );
};

export default PageHeader;