import React from 'react';

const DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']; // Sunday..Saturday

/**
 * Weekday × hour activity heatmap (day 0 = Sunday, hour 0-23).
 * Uses inline flex/grid styles so it does not depend on Tailwind grid-cols-24.
 */
export const Heatmap: React.FC<{ data: number[][]; max?: number }> = ({ data, max }) => {
  const peak = max ?? Math.max(1, ...data.flat());
  return (
    <div className="overflow-x-auto">
      {/* hour axis */}
      <div className="flex mb-1 pl-8">
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="flex-1 text-center text-[8px] text-neutral-400 font-bold">
            {h}
          </div>
        ))}
        <div className="w-4" />
      </div>
      {DAYS.map((day, d) => (
        <div key={day} className="flex items-center mb-1">
          <div className="w-8 text-[9px] font-bold text-neutral-500 shrink-0">{day}</div>
          <div className="flex flex-1 gap-[2px]">
            {data[d].map((v, h) => {
              const alpha = v > 0 ? 0.15 + 0.85 * (v / peak) : 0;
              return (
                <div
                  key={h}
                  title={`${day} ${h}:00 — ${v}`}
                  className="flex-1 h-5 rounded-sm"
                  style={{ background: v > 0 ? `rgba(59,130,246,${alpha})` : 'rgba(0,0,0,0.04)' }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
