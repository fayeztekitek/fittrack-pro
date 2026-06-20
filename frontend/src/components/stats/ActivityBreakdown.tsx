import type { ActivityBreakdown as BreakdownItem } from '../../services/statsService';
import { ACTIVITY_COLORS, ACTIVITY_ICONS } from '../../types/activity.types';

interface ActivityBreakdownProps {
  data: BreakdownItem[];
}

export function ActivityBreakdown({ data }: ActivityBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No activities recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const color = ACTIVITY_COLORS[item.type as keyof typeof ACTIVITY_COLORS] || '#6b7280';
        return (
          <div key={item.type} className="space-y-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>{ACTIVITY_ICONS[item.type as keyof typeof ACTIVITY_ICONS] || '•'}</span>
                <span className="text-sm text-slate-300 font-medium capitalize">
                  {item.type.replace('_', ' ')}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {item.count} sessions · {item.percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${item.percentage}%`, backgroundColor: color }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>{item.totalDistanceKm.toFixed(1)} km</span>
              <span>{item.totalCaloriesKcal.toLocaleString()} kcal</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
