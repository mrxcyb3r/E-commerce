import React from 'react';
import { PageHeader, StatCard } from '.';

interface AdminPageLayoutProps {
  children: React.ReactNode;
  header: {
    title: string;
    subtitle?: string;
    description?: string;
    action?: React.ReactNode;
    breadcrumb?: Array<{ label: string; href?: string }>;
    badge?: { label: string; count?: number };
  };
  className?: string;
}

export const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({
  children,
  header,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <PageHeader {...header} />
      {children}
    </div>
  );
};

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
  badge?: { label: string; count?: number };
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  description,
  action,
  breadcrumb,
  badge,
}) => {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      description={description}
      action={action}
      breadcrumb={breadcrumb}
      badge={badge}
    />
  );
};

interface StatCardGridProps {
  stats: Array<{
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
  }>;
  columns?: { base: number; sm: number; lg: number; xl: number };
  className?: string;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  stats,
  columns = { base: 2, sm: 2, lg: 4, xl: 4 },
  className = '',
}) => {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns.base}, minmax(0, 1fr))`,
      }}
    >
      <style>{`
        @media (min-width: 640px) {
          .stat-grid-responsive { grid-template-columns: repeat(${columns.sm}, minmax(0, 1fr)) !important; }
        }
        @media (min-width: 1024px) {
          .stat-grid-responsive { grid-template-columns: repeat(${columns.lg}, minmax(0, 1fr)) !important; }
        }
        @media (min-width: 1280px) {
          .stat-grid-responsive { grid-template-columns: repeat(${columns.xl}, minmax(0, 1fr)) !important; }
        }
      `}</style>
      <div className={`stat-grid-responsive grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns.base}, minmax(0, 1fr))` }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    </div>
  );
};

export default AdminPageLayout;
