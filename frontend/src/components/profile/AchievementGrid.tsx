import type { Achievement, AchievementBadge } from '../../types/activity.types';
import { BADGE_EMOJIS } from '../../types/activity.types';

interface AchievementGridProps {
  achievements: Achievement[];
}

const ALL_BADGES: { badge: AchievementBadge; displayName: string; description: string }[] = [
  { badge: 'first_run', displayName: 'First Run', description: 'Complete your first activity' },
  { badge: 'distance_5km', displayName: '5K Runner', description: 'Run 5km total distance' },
  { badge: 'distance_10km', displayName: '10K Runner', description: 'Run 10km total distance' },
  { badge: 'distance_50km', displayName: 'Marathon Trainer', description: 'Run 50km total distance' },
  { badge: 'century_ride', displayName: 'Century Rider', description: 'Cycle 100 miles (161km)' },
  { badge: 'speed_demon', displayName: 'Speed Demon', description: 'Reach 15+ km/h max speed' },
  { badge: 'power_beast', displayName: 'Power Beast', description: 'Hit 400W+ cycling power' },
  { badge: 'streak_7_days', displayName: 'Weekly Warrior', description: '7 days active streak' },
  { badge: 'calories_burn_500', displayName: 'Calorie Torcher', description: 'Burn 500+ kcal in one session' },
  { badge: 'cycling_master', displayName: 'Cycling Master', description: 'Cycle 1000km total' },
];

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const earnedMap = new Map(achievements.map((a) => [a.badge, a]));

  return (
    <div className="grid grid-cols-2 gap-3">
      {ALL_BADGES.map((def) => {
        const earned = earnedMap.get(def.badge);
        const isEarned = !!earned?.earnedAt;
        return (
          <div
            key={def.badge}
            className={`p-4 rounded-2xl border backdrop-blur-md text-center transition-all ${
              isEarned
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="text-2xl mb-1">
              {isEarned ? BADGE_EMOJIS[def.badge] : '🔒'}
            </div>
            <div
              className={`text-xs font-bold ${
                isEarned ? 'text-white' : 'text-slate-500'
              }`}
            >
              {def.displayName}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
              {def.description}
            </div>
            {earned?.progressPercent !== undefined && !isEarned && (
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-emerald-500/50"
                  style={{ width: `${earned.progressPercent}%` }}
                />
              </div>
            )}
            {isEarned && (
              <div className="text-[9px] text-emerald-500 mt-1 font-semibold">
                Earned
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
