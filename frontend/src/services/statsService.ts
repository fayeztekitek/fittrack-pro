import type { Activity } from '../types/activity.types';

export interface DailyStats {
  date: string;
  steps: number;
  distanceKm: number;
  caloriesKcal: number;
  activeMinutes: number;
}

export interface StatsSummary {
  totalSteps: number;
  totalDistanceKm: number;
  totalCaloriesKcal: number;
  totalActiveMinutes: number;
  goalsMetCount: number;
  streakDays: number;
}

export interface ActivityBreakdown {
  type: string;
  count: number;
  percentage: number;
  totalDistanceKm: number;
  totalCaloriesKcal: number;
}

class StatsService {
  getDailyStats(activities: Activity[]): DailyStats[] {
    const grouped = new Map<string, DailyStats>();

    for (const act of activities) {
      const date = new Date(act.startedAt).toISOString().split('T')[0];
      const existing = grouped.get(date) || {
        date,
        steps: 0,
        distanceKm: 0,
        caloriesKcal: 0,
        activeMinutes: 0,
      };
      existing.steps += act.totalSteps;
      existing.distanceKm += act.distanceKm;
      existing.caloriesKcal += act.caloriesBurned;
      existing.activeMinutes += Math.round((act.durationSeconds || 0) / 60);
      grouped.set(date, existing);
    }

    return Array.from(grouped.values()).sort(
      (a, b) => a.date.localeCompare(b.date),
    );
  }

  getSummary(activities: Activity[], stepGoal: number = 10000): StatsSummary {
    const totalSteps = activities.reduce((s, a) => s + a.totalSteps, 0);
    const totalDistanceKm = activities.reduce((s, a) => s + a.distanceKm, 0);
    const totalCaloriesKcal = activities.reduce(
      (s, a) => s + a.caloriesBurned,
      0,
    );
    const totalActiveMinutes = activities.reduce(
      (s, a) => s + Math.round((a.durationSeconds || 0) / 60),
      0,
    );

    const goalsMetCount = this.getDailyStats(activities).filter(
      (d) => d.steps >= stepGoal,
    ).length;

    const streakDays = this.calculateStreak(activities);

    return {
      totalSteps,
      totalDistanceKm,
      totalCaloriesKcal,
      totalActiveMinutes,
      goalsMetCount,
      streakDays,
    };
  }

  getActivityBreakdown(activities: Activity[]): ActivityBreakdown[] {
    const grouped = new Map<string, ActivityBreakdown>();
    const total = activities.length || 1;

    for (const act of activities) {
      const existing = grouped.get(act.type) || {
        type: act.type,
        count: 0,
        percentage: 0,
        totalDistanceKm: 0,
        totalCaloriesKcal: 0,
      };
      existing.count++;
      existing.totalDistanceKm += act.distanceKm;
      existing.totalCaloriesKcal += act.caloriesBurned;
      grouped.set(act.type, existing);
    }

    return Array.from(grouped.values()).map((item) => ({
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }

  getLast7Days(activities: Activity[]): DailyStats[] {
    const all = this.getDailyStats(activities);
    return all.slice(-7);
  }

  getLast30Days(activities: Activity[]): DailyStats[] {
    const all = this.getDailyStats(activities);
    return all.slice(-30);
  }

  private calculateStreak(activities: Activity[]): number {
    const days = [
      ...new Set(
        activities.map((a) =>
          new Date(a.startedAt).toISOString().split('T')[0],
        ),
      ),
    ].sort((a, b) => b.localeCompare(a));

    if (days.length === 0) return 0;

    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}

export const statsService = new StatsService();
