import { calculateBmi } from '../../domain/bmi';
import type { BmiResult } from '../../domain/bmi';

interface BmiCardProps {
  weightKg: number;
  heightCm: number;
}

export function BmiCard({ weightKg, heightCm }: BmiCardProps) {
  const bmi: BmiResult = calculateBmi(weightKg, heightCm);

  const categoryLabels: Record<string, string> = {
    underweight: 'Underweight',
    normal: 'Normal',
    overweight: 'Overweight',
    obese: 'Obese',
  };

  return (
    <div
      className="p-5 rounded-2xl border backdrop-blur-md text-center"
      style={{
        backgroundColor: `${bmi.color}10`,
        borderColor: `${bmi.color}30`,
      }}
    >
      <div className="text-4xl font-black" style={{ color: bmi.color }}>
        {bmi.value}
      </div>
      <div
        className="text-sm font-semibold mt-1"
        style={{ color: bmi.color }}
      >
        {categoryLabels[bmi.category] || bmi.category}
      </div>
      <div className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">
        Body Mass Index
      </div>
    </div>
  );
}
