import { Target, Flame, Zap, Trophy } from 'lucide-react';
import type { StatsSummary } from '../../services/statsService';

interface WeeklySummaryProps {
  summary: StatsSummary;
  stepGoal: number;
}

export function WeeklySummary({ summary, stepGoal }: WeeklySummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Target size={16} className="text-emerald-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Goals Met
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.goalsMetCount}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          of {stepGoal.toLocaleString()} step days
        </div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Flame size={16} className="text-amber-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total Calories
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalCaloriesKcal.toLocaleString()}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">kcal burned</div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-blue-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Total Distance
          </span>
        </div>
        <div className="text-2xl font-bold text-white">
          {summary.totalDistanceKm.toFixed(1)}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">km total</div>
      </div>

      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Trophy size={16} className="text-purple-400" />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Streak
          </span>
        </div>
        <div className="text-2xl font-bold text-white">{summary.streakDays}</div>
        <div className="text-xs text-slate-500 mt-0.5">consecutive days</div>
      </div>
    </div>
  );
}
