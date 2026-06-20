import { Footprints, Flame, MapPin, Clock, Gauge } from 'lucide-react';
import { StatCard } from '../shared/StatCard';

interface DailyKpisProps {
  steps: number;
  calories: number;
  distanceKm: number;
  activeMinutes: number;
  avgSpeedKmh: number;
}

export function DailyKpis({
  steps,
  calories,
  distanceKm,
  activeMinutes,
  avgSpeedKmh,
}: DailyKpisProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<Footprints size={16} className="text-emerald-400" />}
        label="Steps"
        value={steps.toLocaleString()}
        color="#10b981"
      />
      <StatCard
        icon={<Flame size={16} className="text-orange-400" />}
        label="Calories"
        value={`${Math.round(calories)}`}
        sub="kcal"
        color="#f59e0b"
      />
      <StatCard
        icon={<MapPin size={16} className="text-blue-400" />}
        label="Distance"
        value={distanceKm.toFixed(2)}
        sub="km"
        color="#3b82f6"
      />
      <StatCard
        icon={<Clock size={16} className="text-purple-400" />}
        label="Active Time"
        value={`${activeMinutes}`}
        sub="min"
        color="#8b5cf6"
      />
      <StatCard
        icon={<Gauge size={16} className="text-cyan-400" />}
        label="Avg Speed"
        value={avgSpeedKmh.toFixed(1)}
        sub="km/h"
        color="#06b6d4"
      />
    </div>
  );
}
