import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
  ) {}

  async getDailyStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activities = await this.activityRepository.find({
      where: {
        userId,
        startedAt: Between(today, tomorrow),
      },
    });

    return this.aggregateActivities(activities);
  }

  async getWeeklyStats(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await this.activityRepository.find({
      where: {
        userId,
        startedAt: Between(sevenDaysAgo, new Date()),
      },
      order: { startedAt: 'ASC' },
    });

    const days = this.groupByDay(activities, 7);
    const totals = this.aggregateActivities(activities);

    return { days, totals };
  }

  async getMonthlyStats(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const activities = await this.activityRepository.find({
      where: {
        userId,
        startedAt: Between(thirtyDaysAgo, new Date()),
      },
      order: { startedAt: 'ASC' },
    });

    const days = this.groupByDay(activities, 30);
    const totals = this.aggregateActivities(activities);

    return { days, totals };
  }

  async getStreak(userId: string) {
    const activities = await this.activityRepository.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });

    const daySet = new Set<string>();
    for (const act of activities) {
      daySet.add(new Date(act.startedAt).toISOString().split('T')[0]);
    }

    const sortedDays = [...daySet].sort((a, b) => b.localeCompare(a));

    if (sortedDays.length === 0) {
      return { streak: 0 };
    }

    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
      } else {
        break;
      }
    }

    return { streak };
  }

  async getActivityBreakdown(userId: string) {
    const activities = await this.activityRepository.find({
      where: { userId },
    });

    const grouped = new Map<string, {
      type: string;
      count: number;
      totalDistanceKm: number;
      totalCaloriesKcal: number;
    }>();
    const total = activities.length || 1;

    for (const act of activities) {
      const existing = grouped.get(act.type) || {
        type: act.type,
        count: 0,
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

  private groupByDay(activities: Activity[], daysBack: number) {
    const dayMap = new Map<string, Activity[]>();

    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, []);
    }

    for (const act of activities) {
      const key = new Date(act.startedAt).toISOString().split('T')[0];
      if (dayMap.has(key)) {
        dayMap.get(key)!.push(act);
      }
    }

    return Array.from(dayMap.entries()).map(([date, acts]) => ({
      date,
      steps: acts.reduce((s, a) => s + a.totalSteps, 0),
      distanceKm: acts.reduce((s, a) => s + a.distanceKm, 0),
      caloriesKcal: acts.reduce((s, a) => s + a.caloriesBurned, 0),
      activeMinutes: acts.reduce(
        (s, a) => s + Math.round((a.durationSeconds || 0) / 60),
        0,
      ),
    }));
  }

  private aggregateActivities(activities: Activity[]) {
    return {
      totalSteps: activities.reduce((s, a) => s + a.totalSteps, 0),
      totalDistanceKm: activities.reduce((s, a) => s + a.distanceKm, 0),
      totalCaloriesKcal: activities.reduce((s, a) => s + a.caloriesBurned, 0),
      totalActiveMinutes: activities.reduce(
        (s, a) => s + Math.round((a.durationSeconds || 0) / 60),
        0,
      ),
    };
  }
}
