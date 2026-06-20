import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}

export function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color ? `${color}15` : undefined }}
        >
          {icon}
        </div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}
