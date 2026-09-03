import React from 'react';
import type { FunnelStage } from '../../../lib/analytics/aggregate';

export const FunnelView: React.FC<{ stages: FunnelStage[] }> = ({ stages }) => {
  if (stages.length === 0) {
    return <p className="text-xs text-neutral-400 text-center py-6">Funnel uchun ma'lumot yetarli emas</p>;
  }
  const first = stages[0].value || 1;
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = Math.max(8, (stage.value / first) * 100);
        const drop = i > 0 ? Math.round(((first - stage.value) / first) * 100) : 0;
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-neutral-900 dark:text-white">{stage.value}</span>
                {drop > 0 && <span className="text-[10px] text-neutral-400">−{drop}%</span>}
              </div>
            </div>
            <div className="h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 overflow-hidden" style={{ width: `${width}%` }}>
              <div className="h-full w-full bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-700 dark:to-indigo-600 rounded-lg" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
