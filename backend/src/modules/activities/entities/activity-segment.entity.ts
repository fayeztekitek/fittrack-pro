import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Activity } from './activity.entity';

@Entity('activity_segments')
@Index(['activityId', 'segmentNumber'])
export class ActivitySegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Activity, (activity) => activity.segments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column()
  activityId: string;

  /**
   * 1-indexed segment number (e.g., segment 1 = 0-1km)
   */
  @Column({ type: 'int' })
  segmentNumber: number;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  distanceKm: number;

  @Column({ type: 'decimal', precision: 5, scale: 1, default: 0 })
  avgSpeedKmh: number;

  @Column({ type: 'int', nullable: true })
  avgPowerWatts: number;

  @Column({ type: 'int', nullable: true })
  maxPowerWatts: number;

  @Column({ type: 'int', nullable: true })
  avgCadenceRpm: number;

  @Column({ type: 'int', default: 0 })
  caloriesBurned: number;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  elevationGainM: number;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp' })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * Domain: Calculate pace (minutes per km)
   */
  calculatePace(): string {
    if (this.avgSpeedKmh === 0) return '∞:∞';
    const minPerKm = 60 / parseFloat(this.avgSpeedKmh.toString());
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
