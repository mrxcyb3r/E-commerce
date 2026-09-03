import React from 'react';

interface BarPoint {
  date: string;
  views: number;
  visitors: number;
}

interface SimpleBarChartProps {
  data: BarPoint[];
  height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, height = 160 }) => {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div
          key={d.date}
          className="flex-1 flex flex-col items-center gap-1 group"
          title={`${d.date} — ${d.views} ko'rish, ${d.visitors} tashrifchi`}
        >
          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            {d.views}
          </span>
          <div
            className="w-full rounded-md bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-700 dark:to-blue-500 group-hover:opacity-80 transition-opacity"
            style={{ height: `${Math.max(3, (d.views / max) * (height - 24))}px` }}
          />
        </div>
      ))}
    </div>
  );
};
