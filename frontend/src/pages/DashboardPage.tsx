import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { activityApiService, statsService } from '../services';
import type { StatsSummary, DailyStats } from '../services/statsService';
import type { Activity } from '../types/activity.types';
import { StepRing } from '../components/dashboard/StepRing';
import { DailyKpis } from '../components/dashboard/DailyKpis';
import { WeeklyChart } from '../components/dashboard/WeeklyChart';
import { WeeklySummary } from '../components/dashboard/WeeklySummary';
import { Play } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const res = await activityApiService.listActivities({ take: 100 });
      setActivities(res.data || []);
    } catch {
      // API may not be available - show empty state
    } finally {
      setLoading(false);
    }
  }

  const stepGoal = user?.profile?.stepGoal || 10000;
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(
    (a) => new Date(a.startedAt).toISOString().split('T')[0] === today,
  );

  const todaySteps = todayActivities.reduce((s, a) => s + a.totalSteps, 0);
  const todayCalories = todayActivities.reduce((s, a) => s + a.caloriesBurned, 0);
  const todayDistance = todayActivities.reduce((s, a) => s + a.distanceKm, 0);
  const todayMinutes = todayActivities.reduce(
    (s, a) => s + Math.round((a.durationSeconds || 0) / 60),
    0,
  );
  const todayAvgSpeed =
    todayActivities.length > 0
      ? todayActivities.reduce((s, a) => s + a.avgSpeedKmh, 0) /
        todayActivities.length
      : 0;

  const weeklyDays: DailyStats[] = statsService.getLast7Days(activities);
  const summary: StatsSummary = statsService.getSummary(activities, stepGoal);

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wider uppercase">
          Dashboard
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Step Ring */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md text-center">
        <StepRing current={todaySteps} goal={stepGoal} />
        <p className="text-sm text-slate-400 mt-2">
          Good morning, {user?.name || 'Athlete'}!
        </p>
      </div>

      {/* Today's KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Today's Activity
        </h2>
        <DailyKpis
          steps={todaySteps}
          calories={todayCalories}
          distanceKm={todayDistance}
          activeMinutes={todayMinutes}
          avgSpeedKmh={todayAvgSpeed}
        />
      </div>

      {/* Weekly Chart */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <WeeklyChart days={weeklyDays} />
        )}
      </div>

      {/* Weekly Summary */}
      <div>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
          Weekly Summary
        </h2>
        <WeeklySummary summary={summary} stepGoal={stepGoal} />
      </div>

      {/* Start Tracking CTA */}
      <button
        onClick={() => navigate('/track')}
        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
      >
        <Play size={20} />
        Start Tracking Now
      </button>
    </div>
  );
}
