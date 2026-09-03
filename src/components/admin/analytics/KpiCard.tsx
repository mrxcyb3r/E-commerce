import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string; // tailwind classes for icon chip
  sub?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, accent, sub }) => {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
      <div className={`inline-flex p-2 rounded-xl ${accent} mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
        {typeof value === 'number' ? value.toLocaleString('uz-UZ') : value}
      </div>
      <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 font-medium">{sub}</p>}
    </div>
  );
};
