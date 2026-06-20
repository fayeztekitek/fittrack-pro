import type { StatsSummary } from '../../services/statsService';
import { Footprints, MapPin, Flame, Clock } from 'lucide-react';

interface StatsSummaryCardsProps {
  summary: StatsSummary;
}

export function StatsSummaryCards({ summary }: StatsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Footprints size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Steps
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalSteps.toLocaleString()}
        </div>
      </div>
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <MapPin size={16} className="text-blue-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Distance
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalDistanceKm.toFixed(1)}
          <span className="text-sm text-slate-400 ml-1">km</span>
        </div>
      </div>
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-orange-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Calories
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalCaloriesKcal.toLocaleString()}
          <span className="text-sm text-slate-400 ml-1">kcal</span>
        </div>
      </div>
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Clock size={16} className="text-purple-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Active Time
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalActiveMinutes}
          <span className="text-sm text-slate-400 ml-1">min</span>
        </div>
      </div>
    </div>
  );
}
