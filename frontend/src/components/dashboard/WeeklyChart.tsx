import type { DailyStats } from '../../services/statsService';

interface WeeklyChartProps {
  days: DailyStats[];
}

export function WeeklyChart({ days }: WeeklyChartProps) {
  if (days.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No activity data this week
      </div>
    );
  }

  const maxSteps = Math.max(...days.map((d) => d.steps), 1);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Weekly Steps
      </h3>
      <div className="flex items-end gap-2 h-32">
        {days.map((day) => {
          const height = (day.steps / maxSteps) * 100;
          const dayLabel = new Date(day.date).toLocaleDateString('en-US', {
            weekday: 'short',
          });
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-slate-500 font-medium">
                {day.steps.toLocaleString()}
              </span>
              <div className="w-full bg-slate-800 rounded-t-md relative" style={{ height: '100%' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md transition-all duration-500"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
