export const ActivityTypeValues = {
  WALKING: 'walking',
  FAST_WALKING: 'fast_walking',
  RUNNING: 'running',
  CYCLING: 'cycling',
} as const;

export type ActivityType = typeof ActivityTypeValues[keyof typeof ActivityTypeValues];

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  distanceKm: number;
  caloriesBurned: number;
  totalSteps: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  elevationGainM?: number;
  maxHeartRate?: number;
  avgHeartRate?: number;
  avgPowerWatts?: number;
  maxPowerWatts?: number;
  avgCadenceRpm?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivitySegment {
  id: string;
  activityId: string;
  segmentNumber: number;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  avgPowerWatts?: number;
  maxPowerWatts?: number;
  avgCadenceRpm?: number;
  caloriesBurned: number;
  elevationGainM?: number;
  startedAt: Date;
  endedAt: Date;
  createdAt: Date;
}

export interface GPSPoint {
  id: string;
  activityId: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
  speedKmh?: number;
  accuracyM?: number;
  bearingDegrees?: number;
  timestamp: Date;
  createdAt: Date;
}

export const AchievementBadgeValues = {
  FIRST_RUN: 'first_run',
  DISTANCE_5KM: 'distance_5km',
  DISTANCE_10KM: 'distance_10km',
  DISTANCE_50KM: 'distance_50km',
  CENTURY_RIDE: 'century_ride',
  SPEED_DEMON: 'speed_demon',
  POWER_BEAST: 'power_beast',
  STREAK_7_DAYS: 'streak_7_days',
  CALORIES_BURN_500: 'calories_burn_500',
  CYCLING_MASTER: 'cycling_master',
} as const;

export type AchievementBadge = typeof AchievementBadgeValues[keyof typeof AchievementBadgeValues];

export interface Achievement {
  id: string;
  userId: string;
  badge: AchievementBadge;
  displayName: string;
  description: string;
  tier: string;
  progressPercent?: number;
  earnedAt?: Date;
  createdAt: Date;
}

export const BADGE_EMOJIS = {
  [AchievementBadgeValues.FIRST_RUN]: '🏃',
  [AchievementBadgeValues.DISTANCE_5KM]: '🎯',
  [AchievementBadgeValues.DISTANCE_10KM]: '🔥',
  [AchievementBadgeValues.DISTANCE_50KM]: '⚡',
  [AchievementBadgeValues.CENTURY_RIDE]: '🚴',
  [AchievementBadgeValues.SPEED_DEMON]: '💨',
  [AchievementBadgeValues.POWER_BEAST]: '💪',
  [AchievementBadgeValues.STREAK_7_DAYS]: '🔗',
  [AchievementBadgeValues.CALORIES_BURN_500]: '🔥',
  [AchievementBadgeValues.CYCLING_MASTER]: '👑',
} as Record<AchievementBadge, string>;

export const ACTIVITY_COLORS = {
  [ActivityTypeValues.WALKING]: '#3b82f6', // blue
  [ActivityTypeValues.FAST_WALKING]: '#8b5cf6', // purple
  [ActivityTypeValues.RUNNING]: '#ef4444', // red
  [ActivityTypeValues.CYCLING]: '#10b981', // green
} as Record<ActivityType, string>;

export const ACTIVITY_ICONS = {
  [ActivityTypeValues.WALKING]: '🚶',
  [ActivityTypeValues.FAST_WALKING]: '🚶‍♂️',
  [ActivityTypeValues.RUNNING]: '🏃',
  [ActivityTypeValues.CYCLING]: '🚴',
} as Record<ActivityType, string>;
