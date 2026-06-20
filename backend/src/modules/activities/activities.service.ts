import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  MoreThan,
  Between,
  IsNull,
  Not,
} from 'typeorm';
import { Activity, ActivityType } from './entities/activity.entity';
import { ActivitySegment } from './entities/activity-segment.entity';
import { GPSPoint } from './entities/gps-point.entity';
import { Achievement, AchievementBadge } from './entities/achievement.entity';
import { User } from '../users/entities/user.entity';
import {
  StartActivityDto,
  StopActivityDto,
  PauseActivityDto,
} from './dto/activity.dto';
import { BatchGPSPointsDto, GPSPointDto } from './dto/gps.dto';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(ActivitySegment)
    private readonly segmentRepository: Repository<ActivitySegment>,
    @InjectRepository(GPSPoint)
    private readonly gpsPointRepository: Repository<GPSPoint>,
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
  ) {}

  /**
   * Start a new activity session
   */
  async startActivity(
    userId: string,
    dto: StartActivityDto,
  ): Promise<Activity> {
    const activity = this.activityRepository.create({
      userId,
      type: dto.type,
      startedAt: new Date(),
      durationSeconds: 0,
      distanceKm: 0,
      caloriesBurned: 0,
      totalSteps: 0,
      maxSpeedKmh: 0,
      avgSpeedKmh: 0,
      elevationGainM: dto.elevationStartM || 0,
      metadata: { notes: dto.notes || '' },
    });

    return this.activityRepository.save(activity);
  }

  /**
   * Stop an activity and finalize metrics
   */
  async stopActivity(
    userId: string,
    activityId: string,
    dto: StopActivityDto,
  ): Promise<Activity> {
    const activity = await this.getActivityOrThrow(activityId, userId);

    if (activity.endedAt) {
      throw new BadRequestException('Activity already stopped');
    }

    activity.endedAt = new Date();
    activity.durationSeconds = dto.durationSeconds;
    activity.distanceKm = parseFloat(dto.distanceKm.toString());
    activity.caloriesBurned = dto.caloriesBurned;
    activity.totalSteps = dto.totalSteps;
    activity.maxSpeedKmh = parseFloat(dto.maxSpeedKmh.toString());
    activity.avgSpeedKmh = parseFloat(dto.avgSpeedKmh.toString());
    activity.elevationGainM = dto.elevationGainM
      ? parseFloat(dto.elevationGainM.toString())
      : 0;
    activity.maxHeartRate = dto.maxHeartRate;
    activity.avgHeartRate = dto.avgHeartRate;
    activity.avgPowerWatts = dto.avgPowerWatts;
    activity.maxPowerWatts = dto.maxPowerWatts;
    activity.avgCadenceRpm = dto.avgCadenceRpm;

    if (dto.metadata) {
      activity.metadata = { ...activity.metadata, ...dto.metadata };
    }

    const saved = await this.activityRepository.save(activity);

    // Evaluate achievements after activity completion
    await this.evaluateAchievements(userId);

    return saved;
  }

  /**
   * Get single activity with full relations
   */
  async getActivity(
    activityId: string,
    userId: string,
  ): Promise<Activity> {
    return this.getActivityOrThrow(activityId, userId);
  }

  /**
   * List activities for user with pagination
   */
  async getUserActivities(
    userId: string,
    options: {
      take?: number;
      skip?: number;
      type?: ActivityType;
      fromDate?: Date;
      toDate?: Date;
    } = {},
  ) {
    const {
      take = 20,
      skip = 0,
      type,
      fromDate,
      toDate,
    } = options;

    const query = this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.userId = :userId', { userId })
      .andWhere('activity.endedAt IS NOT NULL')
      .orderBy('activity.endedAt', 'DESC')
      .take(take)
      .skip(skip);

    if (type) {
      query.andWhere('activity.type = :type', { type });
    }

    if (fromDate || toDate) {
      if (fromDate && toDate) {
        query.andWhere('activity.endedAt BETWEEN :from AND :to', {
          from: fromDate,
          to: toDate,
        });
      } else if (fromDate) {
        query.andWhere('activity.endedAt >= :from', { from: fromDate });
      } else if (toDate) {
        query.andWhere('activity.endedAt <= :to', { to: toDate });
      }
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      take,
      skip,
    };
  }

  /**
   * Batch submit GPS points for an activity
   */
  async submitGPSPoints(
    userId: string,
    activityId: string,
    dto: BatchGPSPointsDto,
  ): Promise<GPSPoint[]> {
    const activity = await this.getActivityOrThrow(activityId, userId);

    if (activity.endedAt) {
      throw new BadRequestException('Cannot add GPS points to ended activity');
    }

    const points = dto.points.map((point) =>
      this.gpsPointRepository.create({
        activityId,
        latitude: point.latitude,
        longitude: point.longitude,
        elevationM: point.elevationM,
        speedKmh: point.speedKmh,
        accuracyM: point.accuracyM,
        bearingDegrees: point.bearingDegrees,
        timestamp: new Date(point.timestamp),
      }),
    );

    return this.gpsPointRepository.save(points);
  }

  /**
   * Get GPS trace for an activity
   */
  async getActivityGPSTrace(
    activityId: string,
    userId: string,
  ): Promise<GPSPoint[]> {
    await this.getActivityOrThrow(activityId, userId);

    return this.gpsPointRepository.find({
      where: { activityId },
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * Calculate cycling power in watts
   * Formula: P = (Crr*m*g + 0.5*Cd*A*ρ*v²) * v
   * Crr = rolling resistance (0.004)
   * Cd = drag coefficient (1.15 for cyclist)
   * A = frontal area (0.5 m²)
   * ρ = air density (1.225 kg/m³)
   */
  calculateCyclingPower(
    speedMsec: number,
    weightKg: number,
    elevationGradient: number = 0,
  ): number {
    const g = 9.81;
    const Crr = 0.004;
    const Cd = 1.15;
    const A = 0.5;
    const rho = 1.225;

    const rollingResistance = Crr * weightKg * g;
    const aerodynamicDrag = 0.5 * Cd * A * rho * Math.pow(speedMsec, 2);
    const gravitationalForce = weightKg * g * elevationGradient;

    const totalForce = rollingResistance + aerodynamicDrag + gravitationalForce;
    const power = totalForce * speedMsec;

    return Math.max(0, Math.round(power));
  }

  /**
   * Classify power into training zone (1-6) based on FTP
   * FTP (Functional Threshold Power) estimated as 3.5W/kg
   */
  getPowerZone(
    watts: number,
    weightKg: number,
  ): { zone: number; label: string; percentage: number } {
    const ftp = weightKg * 3.5;
    const percentage = (watts / ftp) * 100;

    if (percentage < 56) {
      return { zone: 1, label: 'Recovery', percentage };
    } else if (percentage < 76) {
      return { zone: 2, label: 'Endurance', percentage };
    } else if (percentage < 90) {
      return { zone: 3, label: 'Tempo', percentage };
    } else if (percentage < 104) {
      return { zone: 4, label: 'Threshold', percentage };
    } else if (percentage < 121) {
      return { zone: 5, label: 'VO2 Max', percentage };
    } else {
      return { zone: 6, label: 'Anaerobic', percentage };
    }
  }

  /**
   * Calculate calories based on MET (Metabolic Equivalent)
   * MET = energy expenditure / weight
   * Calories = MET * weight * hours
   */
  calculateCaloriesMET(
    activityType: ActivityType,
    weightKg: number,
    durationHours: number,
  ): number {
    const metValues: Record<ActivityType, number> = {
      [ActivityType.WALKING]: 3.5, // 3 mph walking
      [ActivityType.FAST_WALKING]: 5.0, // 4 mph walking
      [ActivityType.RUNNING]: 9.8, // 10 minute mile
      [ActivityType.CYCLING]: 8.0, // Moderate, 12-14 mph
    };

    const met = metValues[activityType] || 5.0;
    return Math.round(met * weightKg * durationHours);
  }

  /**
   * Estimate distance from step count
   * Average stride length: 0.75 meters per step
   */
  estimateDistanceFromSteps(totalSteps: number): number {
    const strideLength = 0.75; // meters
    return (totalSteps * strideLength) / 1000; // km
  }

  /**
   * Record activity segment (1km split for cycling)
   */
  async recordSegment(
    userId: string,
    activityId: string,
    segment: any,
  ): Promise<ActivitySegment> {
    const activity = await this.getActivityOrThrow(activityId, userId);

    const newSegment = this.segmentRepository.create({
      activityId,
      segmentNumber: segment.segmentNumber,
      durationSeconds: segment.durationSeconds,
      distanceKm: segment.distanceKm,
      avgSpeedKmh: segment.avgSpeedKmh,
      avgPowerWatts: segment.avgPowerWatts,
      maxPowerWatts: segment.maxPowerWatts,
      avgCadenceRpm: segment.avgCadenceRpm,
      caloriesBurned: segment.caloriesBurned,
      elevationGainM: segment.elevationGainM,
      startedAt: new Date(segment.startedAt),
      endedAt: new Date(segment.endedAt),
    });

    return this.segmentRepository.save(newSegment);
  }

  /**
   * Evaluate and award achievements for user
   */
  private async evaluateAchievements(userId: string): Promise<void> {
    try {
      const activities = await this.activityRepository.find({
        where: { userId, endedAt: Not(IsNull()) },
        order: { endedAt: 'DESC' },
        take: 100,
      });

      if (activities.length === 0) {
        return;
      }

      // First run achievement
      if (activities.length === 1) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.FIRST_RUN,
          'First Run',
          'Completed your first activity',
        );
      }

      // Distance milestones
      const totalDistance = activities.reduce(
        (sum, a) => sum + parseFloat(a.distanceKm.toString()),
        0,
      );

      if (totalDistance >= 5) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.DISTANCE_5KM,
          '5K Runner',
          'Accumulated 5km of total distance',
        );
      }

      if (totalDistance >= 10) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.DISTANCE_10KM,
          '10K Runner',
          'Accumulated 10km of total distance',
        );
      }

      if (totalDistance >= 50) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.DISTANCE_50KM,
          'Marathon Trainer',
          'Accumulated 50km of total distance',
        );
      }

      // Cycling specific
      const cyclingActivities = activities.filter(
        (a) => a.type === ActivityType.CYCLING,
      );
      const cyclingDistance = cyclingActivities.reduce(
        (sum, a) => sum + parseFloat(a.distanceKm.toString()),
        0,
      );

      if (cyclingDistance >= 160.9) {
        // 100 miles
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.CENTURY_RIDE,
          'Century Rider',
          'Completed 100 miles on a bike',
        );
      }

      if (cyclingDistance >= 1000) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.CYCLING_MASTER,
          'Cycling Master',
          '1000km on the bike',
        );
      }

      // Speed records
      const maxSpeed = Math.max(...activities.map((a) => a.maxSpeedKmh));
      if (maxSpeed >= 15) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.SPEED_DEMON,
          'Speed Demon',
          'Achieved 15+ km/h on a run',
        );
      }

      // Power records
      const maxPower = Math.max(
        ...cyclingActivities
          .filter((a) => a.maxPowerWatts)
          .map((a) => a.maxPowerWatts || 0),
      );
      if (maxPower >= 400) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.POWER_BEAST,
          'Power Beast',
          '400W average power on the bike',
        );
      }

      // Calorie burnout
      const maxCalories = Math.max(
        ...activities.map((a) => a.caloriesBurned),
      );
      if (maxCalories >= 500) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.CALORIES_BURN_500,
          'Calorie Torcher',
          'Burned 500+ calories in one activity',
        );
      }

      // Streak (activities in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivities = activities.filter(
        (a) => a.endedAt > sevenDaysAgo,
      );

      if (recentActivities.length >= 7) {
        await this.awardAchievementIfNotEarned(
          userId,
          AchievementBadge.STREAK_7_DAYS,
          'Weekly Warrior',
          '7 activities in the last 7 days',
        );
      }
    } catch (error) {
      this.logger.error(`Error evaluating achievements for user ${userId}:`, error);
    }
  }

  /**
   * Award achievement if not already earned
   */
  private async awardAchievementIfNotEarned(
    userId: string,
    badge: AchievementBadge,
    displayName: string,
    description: string,
  ): Promise<void> {
    const existing = await this.achievementRepository.findOne({
      where: { userId, badge },
    });

    if (!existing) {
      const achievement = this.achievementRepository.create({
        userId,
        badge,
        displayName,
        description,
        earnedAt: new Date(),
        tier: 'gold',
      });

      await this.achievementRepository.save(achievement);
      this.logger.log(`Achievement awarded: ${displayName} to user ${userId}`);
    }
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.achievementRepository.find({
      where: { userId },
      order: { earnedAt: 'DESC' },
    });
  }

  // Helper: Get activity and authorize user
  private async getActivityOrThrow(
    activityId: string,
    userId: string,
  ): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id: activityId },
      relations: ['gpsPoints', 'segments'],
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.userId !== userId) {
      throw new ForbiddenException('Access denied to this activity');
    }

    return activity;
  }
}
