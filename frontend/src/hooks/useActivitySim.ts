import { useEffect, useRef, useCallback } from 'react';

interface UseActivitySimOptions {
  enabled: boolean;
  activityType: string;
  onMetricsUpdate: (metrics: {
    speedKmh: number;
    distanceKm: number;
    steps: number;
    cadenceRpm: number;
  }) => void;
  intervalMs?: number;
}

export function useActivitySim({
  enabled,
  activityType,
  onMetricsUpdate,
  intervalMs = 1000,
}: UseActivitySimOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const distRef = useRef(0);
  const stepsRef = useRef(0);

  const isCycling = activityType === 'cycling';

  const generateSample = useCallback(() => {
    const baseSpeed = isCycling ? 25 : 6;
    const speed = Math.max(
      0.5,
      baseSpeed + (Math.random() - 0.5) * 4,
    );
    const distDelta = speed / 3600;
    distRef.current += distDelta;

    const stepDelta = isCycling ? 0 : Math.round(speed * 40 + Math.random() * 10);
    stepsRef.current += stepDelta;

    const cadenceRpm = isCycling
      ? Math.round(60 + Math.random() * 30)
      : 0;

    return {
      speedKmh: Math.round(speed * 10) / 10,
      distanceKm: Math.round(distRef.current * 1000) / 1000,
      steps: stepDelta,
      cadenceRpm,
    };
  }, [isCycling]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      distRef.current = 0;
      stepsRef.current = 0;
      return;
    }

    intervalRef.current = setInterval(() => {
      const sample = generateSample();
      onMetricsUpdate(sample);
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, generateSample, intervalMs, onMetricsUpdate]);
}
