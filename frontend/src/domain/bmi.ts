export interface BmiResult {
  value: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  color: string;
}

export function calculateBmi(weightKg: number, heightCm: number): BmiResult {
  const heightM = heightCm / 100;
  const value = weightKg / (heightM * heightM);
  let category: BmiResult['category'];
  let color: string;

  if (value < 18.5) {
    category = 'underweight';
    color = '#3b82f6';
  } else if (value < 25) {
    category = 'normal';
    color = '#10b981';
  } else if (value < 30) {
    category = 'overweight';
    color = '#f59e0b';
  } else {
    category = 'obese';
    color = '#ef4444';
  }

  return { value: Math.round(value * 10) / 10, category, color };
}
