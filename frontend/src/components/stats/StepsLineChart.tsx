import type { DailyStats } from '../../services/statsService';

interface StepsLineChartProps {
  days: DailyStats[];
}

export function StepsLineChart({ days }: StepsLineChartProps) {
  if (days.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        No data for this period
      </div>
    );
  }

  const maxSteps = Math.max(...days.map((d) => d.steps), 1000);
  const w = 600;
  const h = 200;
  const px = 40;
  const py = 20;
  const chartW = w - px * 2;
  const chartH = h - py * 2;

  const points = days.map((d, i) => {
    const x = px + (i / Math.max(days.length - 1, 1)) * chartW;
    const y = py + chartH - (d.steps / maxSteps) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${py + chartH} L${points[0].x},${py + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
      <defs>
        <linearGradient id="steps-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#steps-fill)" />
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r="3.5" fill="#10b981" stroke="#090910" strokeWidth="2" />
      ))}
    </svg>
  );
}
