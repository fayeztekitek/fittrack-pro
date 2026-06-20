interface GenderToggleProps {
  value: 'male' | 'female' | 'other';
  onChange: (v: 'male' | 'female' | 'other') => void;
}

const options: { value: 'male' | 'female' | 'other'; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export function GenderToggle({ value, onChange }: GenderToggleProps) {
  return (
    <div className="flex bg-slate-900/60 border border-slate-800 rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
            value === opt.value
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
