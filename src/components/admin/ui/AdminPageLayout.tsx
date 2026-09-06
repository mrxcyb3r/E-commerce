import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  PageHeader,
  ActionButton,
  StatCard,
  EmptyState,
  LoadingSkeleton,
  ErrorState,
} from '.';

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
      <div className="card">
        {children}
      </div>
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
  columns = { base: 1, sm: 2, lg: 4, xl: 4 },
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-${columns.base} sm:grid-cols-${columns.sm} lg:grid-cols-${columns.lg} xl:grid-cols-${columns.xl} gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default AdminPageLayout;