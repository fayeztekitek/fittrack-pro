interface Segment {
  km: number;
  speed: number;
  time: number;
}

interface CyclingSegmentsProps {
  segments: Segment[];
}

export function CyclingSegments({ segments }: CyclingSegmentsProps) {
  if (segments.length === 0) return null;

  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md">
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
        1km Splits
      </h3>
      <div className="space-y-1.5">
        {segments.map((seg) => {
          const pace = seg.speed > 0 ? (60 / seg.speed).toFixed(1) : '--';
          const min = Math.floor(seg.time / 60);
          const sec = seg.time % 60;
          return (
            <div
              key={seg.km}
              className="flex items-center justify-between py-1.5 px-3 bg-slate-800/50 rounded-lg text-sm"
            >
              <span className="text-emerald-400 font-bold w-10">
                {seg.km}km
              </span>
              <span className="text-slate-300">
                {pace} min/km
              </span>
              <span className="text-slate-400 text-xs">
                {min}:{sec.toString().padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
