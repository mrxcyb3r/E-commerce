import React from 'react';
import type { AdvancedFunnelStage } from '../../../lib/analytics/advanced';

export const FunnelView: React.FC<{ stages: AdvancedFunnelStage[] }> = ({ stages }) => {
  if (stages.length === 0) {
    return <p className="text-xs text-neutral-400 text-center py-6">Ma'lumot yetarli emas</p>;
  }
  const first = stages[0].value || 1;
  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = Math.max(8, (stage.value / first) * 100);
        const overallDrop = i > 0 ? Math.round(((first - stage.value) / first) * 100) : 0;
        const conv =
          stage.conversionFromPrev != null ? Math.round(stage.conversionFromPrev * 100) : null;
        const drop = stage.dropOffFromPrev != null ? Math.round(stage.dropOffFromPrev * 100) : null;
        return (
          <div key={stage.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-700 dark:text-neutral-300">{stage.label}</span>
              <div className="flex items-center gap-2">
                {conv != null && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                    {conv}% o'tdi
                  </span>
                )}
                <span className="font-black text-neutral-900 dark:text-white">{stage.value}</span>
                {drop != null && drop > 0 && (
                  <span className="text-[10px] text-rose-500 font-bold">−{drop}%</span>
                )}
                {i > 0 && overallDrop > 0 && (
                  <span className="text-[10px] text-neutral-400">umumiy −{overallDrop}%</span>
                )}
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
