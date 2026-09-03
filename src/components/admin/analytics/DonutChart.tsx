import React from 'react';

interface DonutPoint {
  label: string;
  value: number;
}

/** Circular donut for small breakdowns. Renders an SVG ring per slice. */
export const DonutChart: React.FC<{ data: DonutPoint[]; size?: number; thickness?: number }> = ({
  data,
  size = 140,
  thickness = 18,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) return <p className="text-xs text-neutral-400 text-center py-6">Ma\'lumot yo\'q</p>;

  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {data.map((d, i) => {
          const len = total > 0 ? (d.value / total) * circ : 0;
          const el = (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className="text-neutral-600 dark:text-neutral-300 capitalize">{d.label}</span>
            <span className="font-black text-neutral-900 dark:text-white">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
