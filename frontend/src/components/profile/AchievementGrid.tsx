import type { Achievement } from '../../types/activity.types';
import { BADGE_EMOJIS } from '../../types/activity.types';

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  if (achievements.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Complete activities to earn achievements
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {achievements.map((ach) => {
        const earned = !!ach.earnedAt;
        return (
          <div
            key={ach.id}
            className={`p-4 rounded-2xl border backdrop-blur-md text-center transition-all ${
              earned
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-slate-900/40 border-slate-800 opacity-50'
            }`}
          >
            <div className="text-2xl mb-1">
              {earned ? BADGE_EMOJIS[ach.badge] || '🏅' : '🔒'}
            </div>
            <div
              className={`text-xs font-bold ${
                earned ? 'text-white' : 'text-slate-500'
              }`}
            >
              {ach.displayName}
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5 leading-tight">
              {ach.description}
            </div>
            {ach.progressPercent !== undefined && !earned && (
              <div className="mt-2 w-full bg-slate-800 rounded-full h-1">
                <div
                  className="h-1 rounded-full bg-emerald-500/50"
                  style={{ width: `${ach.progressPercent}%` }}
                />
              </div>
            )}
            {earned && (
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
