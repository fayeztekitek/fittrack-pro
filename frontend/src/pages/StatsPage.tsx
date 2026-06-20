import { useEffect, useState } from 'react';
import { activityApiService, statsService } from '../services';
import type { Activity } from '../types/activity.types';
import type { DailyStats, StatsSummary, ActivityBreakdown as Breakdown } from '../services/statsService';
import { PeriodSelector } from '../components/stats/PeriodSelector';
import { StatsSummaryCards } from '../components/stats/StatsSummaryCards';
import { StepsLineChart } from '../components/stats/StepsLineChart';
import { CaloriesBarChart } from '../components/stats/CaloriesBarChart';
import { ActivityBreakdown } from '../components/stats/ActivityBreakdown';

export function StatsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const res = await activityApiService.listActivities({ take: 200 });
      setActivities(res.data || []);
    } catch {
      // API may not be available
    } finally {
      setLoading(false);
    }
  }

  const filtered: DailyStats[] =
    period === 'week'
      ? statsService.getLast7Days(activities)
      : statsService.getLast30Days(activities);

  const summary: StatsSummary = statsService.getSummary(
    activities,
    10000,
  );

  const breakdown: Breakdown[] = statsService.getActivityBreakdown(activities);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider uppercase">
          Statistics
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
          Activity Analytics
        </p>
      </div>

      {/* Period Toggle */}
      <PeriodSelector value={period} onChange={setPeriod} />

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <StatsSummaryCards summary={summary} />

          {/* Steps Trend */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Steps Trend
            </h3>
            <StepsLineChart days={filtered} />
          </div>

          {/* Calories Burned */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Calories Burned
            </h3>
            <CaloriesBarChart days={filtered} />
          </div>

          {/* Activity Breakdown */}
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Activity Breakdown
            </h3>
            <ActivityBreakdown data={breakdown} />
          </div>
        </>
      )}
    </div>
  );
}
