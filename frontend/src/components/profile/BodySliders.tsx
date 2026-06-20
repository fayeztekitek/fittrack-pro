interface BodySlidersProps {
  weightKg: number;
  heightCm: number;
  age: number;
  onWeightChange: (v: number) => void;
  onHeightChange: (v: number) => void;
  onAgeChange: (v: number) => void;
}

export function BodySliders({
  weightKg,
  heightCm,
  age,
  onWeightChange,
  onHeightChange,
  onAgeChange,
}: BodySlidersProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Weight
          </span>
          <span className="text-sm font-bold text-white">{weightKg} kg</span>
        </div>
        <input
          type="range"
          min="30"
          max="200"
          step="0.5"
          value={weightKg}
          onChange={(e) => onWeightChange(parseFloat(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Height
          </span>
          <span className="text-sm font-bold text-white">{heightCm} cm</span>
        </div>
        <input
          type="range"
          min="100"
          max="230"
          step="1"
          value={heightCm}
          onChange={(e) => onHeightChange(parseInt(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Age
          </span>
          <span className="text-sm font-bold text-white">{age}</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="1"
          value={age}
          onChange={(e) => onAgeChange(parseInt(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>
    </div>
  );
}
