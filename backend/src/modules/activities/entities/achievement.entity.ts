import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AchievementBadge {
  FIRST_RUN = 'first_run',
  DISTANCE_5KM = 'distance_5km',
  DISTANCE_10KM = 'distance_10km',
  DISTANCE_50KM = 'distance_50km',
  CENTURY_RIDE = 'century_ride', // 100 miles cycling
  SPEED_DEMON = 'speed_demon', // Run at 15+ km/h
  POWER_BEAST = 'power_beast', // 400W+ avg on bike
  STREAK_7_DAYS = 'streak_7_days',
  CALORIES_BURN_500 = 'calories_burn_500', // Single session
  CYCLING_MASTER = 'cycling_master', // 1000km on bike
}

@Entity('achievements')
@Unique(['userId', 'badge'])
@Index(['userId', 'earnedAt'])
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.achievements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: AchievementBadge })
  badge: AchievementBadge;

  /**
   * Progress value (0-100%). Null if fully completed.
   */
  @Column({ type: 'int', nullable: true })
  progressPercent: number;

  /**
   * Display name of achievement
   */
  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  /**
   * Description of what's needed to earn it
   */
  @Column({ type: 'text' })
  description: string;

  /**
   * Tier: bronze, silver, gold
   */
  @Column({ type: 'varchar', length: 20, default: 'bronze' })
  tier: string;

  @Column({ type: 'timestamp', nullable: true })
  earnedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  /**
   * Domain: Check if achievement is fully earned
   */
  isEarned(): boolean {
    return this.earnedAt !== null;
  }

  /**
   * Domain: Get badge display emoji
   */
  getEmoji(): string {
    const emojiMap: Record<AchievementBadge, string> = {
      [AchievementBadge.FIRST_RUN]: '🏃',
      [AchievementBadge.DISTANCE_5KM]: '🎯',
      [AchievementBadge.DISTANCE_10KM]: '🔥',
      [AchievementBadge.DISTANCE_50KM]: '⚡',
      [AchievementBadge.CENTURY_RIDE]: '🚴',
      [AchievementBadge.SPEED_DEMON]: '💨',
      [AchievementBadge.POWER_BEAST]: '💪',
      [AchievementBadge.STREAK_7_DAYS]: '🔗',
      [AchievementBadge.CALORIES_BURN_500]: '🔥',
      [AchievementBadge.CYCLING_MASTER]: '👑',
    };
    return emojiMap[this.badge] || '🏆';
  }
}
