import { useRef, useEffect } from 'react';

interface GpsPoint {
  latitude: number;
  longitude: number;
}

interface GpsMapProps {
  points: GpsPoint[];
  width?: number;
  height?: number;
}

export function GpsMap({ points, width = 400, height = 200 }: GpsMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const lats = points.map((p) => p.latitude);
    const lngs = points.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 20;
    const rangeLat = maxLat - minLat || 1;
    const rangeLng = maxLng - minLng || 1;

    const toX = (lng: number) =>
      pad + ((lng - minLng) / rangeLng) * (width - pad * 2);
    const toY = (lat: number) =>
      pad + ((maxLat - lat) / rangeLat) * (height - pad * 2);

    // Draw route line
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(16,185,129,0.3)';
    ctx.shadowBlur = 8;

    points.forEach((p, i) => {
      const x = toX(p.longitude);
      const y = toY(p.latitude);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw start point
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(toX(points[0].longitude), toY(points[0].latitude), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S', toX(points[0].longitude), toY(points[0].latitude) + 3);

    // Draw end point
    const last = points[points.length - 1];
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(toX(last.longitude), toY(last.latitude), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('E', toX(last.longitude), toY(last.latitude) + 3);
  }, [points, width, height]);

  if (points.length < 2) {
    return (
      <div
        className="bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 text-sm"
        style={{ height }}
      >
        Collecting GPS data...
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ width, height, aspectRatio: `${width}/${height}` }}
      />
    </div>
  );
}
