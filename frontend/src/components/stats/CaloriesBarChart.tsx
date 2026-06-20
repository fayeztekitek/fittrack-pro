import type { DailyStats } from '../../services/statsService';

interface CaloriesBarChartProps {
  days: DailyStats[];
}

export function CaloriesBarChart({ days }: CaloriesBarChartProps) {
  if (days.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
        No data for this period
      </div>
    );
  }

  const maxCals = Math.max(...days.map((d) => d.caloriesKcal), 100);

  return (
    <div className="flex items-end gap-1.5 h-32">
      {days.map((day) => {
        const height = (day.caloriesKcal / maxCals) * 100;
        const label = new Date(day.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-slate-500 font-medium">
              {day.caloriesKcal}
            </span>
            <div className="w-full bg-slate-800 rounded-t-sm relative" style={{ height: '100%' }}>
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm transition-all duration-500"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-[8px] text-slate-400">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
