interface GoalSliderProps {
  value: number;
  onChange: (v: number) => void;
}

export function GoalSlider({ value, onChange }: GoalSliderProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          Daily Step Goal
        </span>
        <span className="text-sm font-bold text-emerald-400">
          {value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min="3000"
        max="20000"
        step="500"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-emerald-500"
      />
      <div className="flex justify-between text-[10px] text-slate-600 mt-0.5">
        <span>3,000</span>
        <span>20,000</span>
      </div>
    </div>
  );
}
