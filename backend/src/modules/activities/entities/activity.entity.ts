import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ActivitySegment } from './activity-segment.entity';
import { GPSPoint } from './gps-point.entity';

export enum ActivityType {
  WALKING = 'walking',
  FAST_WALKING = 'fast_walking',
  RUNNING = 'running',
  CYCLING = 'cycling',
}

@Entity('activities')
@Index(['userId', 'createdAt'])
@Index(['userId', 'startedAt'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  distanceKm: number;

  @Column({ type: 'int', default: 0 })
  caloriesBurned: number;

  @Column({ type: 'int', default: 0 })
  totalSteps: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  maxSpeedKmh: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  avgSpeedKmh: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  elevationGainM: number;

  @Column({ type: 'int', nullable: true })
  maxHeartRate: number;

  @Column({ type: 'int', nullable: true })
  avgHeartRate: number;

  /**
   * Cycling-specific: Average watts during activity
   */
  @Column({ type: 'int', nullable: true })
  avgPowerWatts: number;

  /**
   * Cycling-specific: Max watts achieved during activity
   */
  @Column({ type: 'int', nullable: true })
  maxPowerWatts: number;

  /**
   * Cycling-specific: Average cadence (RPM)
   */
  @Column({ type: 'int', nullable: true })
  avgCadenceRpm: number;

  /**
   * JSON metadata: { temp, humidity, weather, notes }
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(
    () => ActivitySegment,
    (segment) => segment.activity,
    { cascade: true, eager: false },
  )
  segments: ActivitySegment[];

  @OneToMany(() => GPSPoint, (point) => point.activity, {
    cascade: true,
    eager: false,
  })
  gpsPoints: GPSPoint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Domain: Calculate MET-based calories for non-cycling activities
   */
  calculateCaloriesBurned(
    weightKg: number,
    activityType: ActivityType,
    durationHours: number,
  ): number {
    const metMap: Record<ActivityType, number> = {
      [ActivityType.WALKING]: 3.5,
      [ActivityType.FAST_WALKING]: 5.0,
      [ActivityType.RUNNING]: 9.8,
      [ActivityType.CYCLING]: 8.0, // Moderate cycling
    };

    const met = metMap[activityType];
    return Math.round(met * weightKg * durationHours);
  }

  /**
   * Domain: Calculate average speed
   */
  calculateAvgSpeed(): number {
    if (this.durationSeconds === 0) return 0;
    return (this.distanceKm / (this.durationSeconds / 3600)) * 1;
  }

  /**
   * Domain: Estimate elevation gain from GPS points
   */
  estimateElevationGain(): number {
    if (!this.gpsPoints || this.gpsPoints.length < 2) return 0;

    let totalGain = 0;
    const sorted = this.gpsPoints.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (let i = 1; i < sorted.length; i++) {
      const prevElevation = sorted[i - 1].elevationM ?? 0;
      const currElevation = sorted[i].elevationM ?? 0;
      const gain = currElevation - prevElevation;
      if (gain > 0) {
        totalGain += gain;
      }
    }

    return Math.round(totalGain);
  }
}
