interface StepRingProps {
  current: number;
  goal: number;
}

export function StepRing({ current, goal }: StepRingProps) {
  const pct = Math.min(current / goal, 1);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke="#1e293b" strokeWidth="10"
        />
        <circle
          cx="80" cy="80" r={radius}
          fill="none" stroke="#10b981" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-4xl font-black text-white">
          {Math.round(pct * 100)}%
        </div>
        <div className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
          {current.toLocaleString()} / {goal.toLocaleString()} steps
        </div>
      </div>
    </div>
  );
}
