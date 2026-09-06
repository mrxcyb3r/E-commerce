import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  accent?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon: Icon,
  accent = 'text-blue-500',
  subtitle,
  action,
  children,
}) => {
  return (
    <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Icon className={`w-4 h-4 ${accent}`} />
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
};
