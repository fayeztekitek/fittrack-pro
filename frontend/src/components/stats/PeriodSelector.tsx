interface PeriodSelectorProps {
  value: 'week' | 'month';
  onChange: (period: 'week' | 'month') => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1">
      <button
        onClick={() => onChange('week')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
          value === 'week'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        Week
      </button>
      <button
        onClick={() => onChange('month')}
        className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
          value === 'month'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        Month
      </button>
    </div>
  );
}
