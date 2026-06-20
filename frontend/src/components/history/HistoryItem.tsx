import type { Activity } from '../../types/activity.types';
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '../../types/activity.types';
import { MapPin, Flame, Gauge, TrendingUp } from 'lucide-react';

interface HistoryItemProps {
  activity: Activity;
}

export function HistoryItem({ activity }: HistoryItemProps) {
  const date = new Date(activity.startedAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = new Date(activity.startedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const durationMin = Math.round((activity.durationSeconds || 0) / 60);
  const color = ACTIVITY_COLORS[activity.type as keyof typeof ACTIVITY_COLORS] || '#6b7280';

  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            {ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] || '•'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white capitalize">
              {activity.type.replace('_', ' ')}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {date} · {time}
            </p>
          </div>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-1 rounded-md"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {durationMin} min
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5">
            <TrendingUp size={10} />
            Steps
          </div>
          <div className="text-xs font-bold text-white">
            {activity.totalSteps.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5">
            <MapPin size={10} />
            Dist
          </div>
          <div className="text-xs font-bold text-white">
            {activity.distanceKm.toFixed(2)} km
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5">
            <Flame size={10} />
            Cal
          </div>
          <div className="text-xs font-bold text-white">
            {activity.caloriesBurned}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5">
            <Gauge size={10} />
            Speed
          </div>
          <div className="text-xs font-bold text-white">
            {activity.avgSpeedKmh.toFixed(1)}
          </div>
        </div>
      </div>

      {activity.avgPowerWatts && activity.avgPowerWatts > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-800 flex gap-4 text-[10px] text-slate-400">
          <span>Avg Power: <strong className="text-yellow-400">{activity.avgPowerWatts}W</strong></span>
          {activity.elevationGainM && activity.elevationGainM > 0 && (
            <span>Elevation: <strong className="text-cyan-400">{activity.elevationGainM}m</strong></span>
          )}
        </div>
      )}
    </div>
  );
}
