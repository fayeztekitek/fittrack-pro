import { useCallback, useRef, useState } from 'react';
import type { ActivityType } from '../types/activity.types';
import { ActivityTypeValues } from '../types/activity.types';

export const SessionStateValues = {
  NOT_STARTED: 'NOT_STARTED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  STOPPED: 'STOPPED',
} as const;

export type SessionState = typeof SessionStateValues[keyof typeof SessionStateValues];

export interface SessionMetrics {
  durationSeconds: number;
  distanceKm: number;
  caloriesBurned: number;
  totalSteps: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  elevationGainM?: number;
  maxHeartRate?: number;
  avgHeartRate?: number;
  avgPowerWatts?: number;
  maxPowerWatts?: number;
  avgCadenceRpm?: number;
}

export interface UseActivitySessionOptions {
  activityType: ActivityType;
  userWeight: number;
  onSessionStart?: (activityId: string) => void;
  onSessionStop?: (metrics: SessionMetrics) => void;
  onSessionPause?: (elapsedSeconds: number) => void;
  onSessionResume?: () => void;
  onMetricsUpdate?: (metrics: Partial<SessionMetrics>) => void;
}

export const useActivitySession = (options: UseActivitySessionOptions) => {
  const {
    activityType,
    userWeight,
    onSessionStart,
    onSessionStop,
    onSessionPause,
    onSessionResume,
    onMetricsUpdate,
  } = options;

  const [state, setState] = useState<SessionState>(
    SessionStateValues.NOT_STARTED,
  );
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sessionStartRef = useRef<Date | null>(null);
  const pauseStartRef = useRef<Date | null>(null);
  const pausedDurationRef = useRef(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const metricsRef = useRef<SessionMetrics>({
    durationSeconds: 0,
    distanceKm: 0,
    caloriesBurned: 0,
    totalSteps: 0,
    maxSpeedKmh: 0,
    avgSpeedKmh: 0,
  });

  /**
   * Start new activity session
   */
  const start = useCallback(
    async (id: string) => {
      sessionStartRef.current = new Date();
      pausedDurationRef.current = 0;
      metricsRef.current = {
        durationSeconds: 0,
        distanceKm: 0,
        caloriesBurned: 0,
        totalSteps: 0,
        maxSpeedKmh: 0,
        avgSpeedKmh: 0,
      };

      setSessionId(id);
      setState(SessionStateValues.RUNNING);

      // Start 1-second update timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }

      timerIntervalRef.current = setInterval(() => {
        if (sessionStartRef.current && state === SessionStateValues.RUNNING) {
          const elapsed = Math.floor(
            (Date.now() - sessionStartRef.current.getTime()) / 1000,
          ) - pausedDurationRef.current;
          metricsRef.current.durationSeconds = Math.max(0, elapsed);

          onMetricsUpdate?.(metricsRef.current);
        }
      }, 1000);

      onSessionStart?.(id);
    },
    [onSessionStart, onMetricsUpdate, state],
  );

  /**
   * Pause running session
   */
  const pause = useCallback(() => {
    if (state !== SessionStateValues.RUNNING) return;

    pauseStartRef.current = new Date();
    setState(SessionStateValues.PAUSED);

    const elapsedSeconds = metricsRef.current.durationSeconds;
    onSessionPause?.(elapsedSeconds);
  }, [state, onSessionPause]);

  /**
   * Resume paused session
   */
  const resume = useCallback(() => {
    if (state !== SessionStateValues.PAUSED || !pauseStartRef.current) return;

    const pausedDuration = Math.floor(
      (Date.now() - pauseStartRef.current.getTime()) / 1000,
    );
    pausedDurationRef.current += pausedDuration;
    pauseStartRef.current = null;

    setState(SessionStateValues.RUNNING);
    onSessionResume?.();
  }, [state, onSessionResume]);

  /**
   * Stop session and save metrics
   */
  const stop = useCallback(async () => {
    if (state === SessionStateValues.NOT_STARTED) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setState(SessionStateValues.STOPPED);

    // Finalize metrics
    const finalMetrics = { ...metricsRef.current };

    onSessionStop?.(finalMetrics);

    return finalMetrics;
  }, [state, onSessionStop]);

  /**
   * Update session metrics
   */
  const updateMetrics = useCallback(
    (updates: Partial<SessionMetrics>) => {
      metricsRef.current = { ...metricsRef.current, ...updates };
      onMetricsUpdate?.(metricsRef.current);
    },
    [onMetricsUpdate],
  );

  /**
   * Update single metric value
   */
  const setMetric = useCallback(
    (key: keyof SessionMetrics, value: any) => {
      metricsRef.current = { ...metricsRef.current, [key]: value };
      onMetricsUpdate?.(metricsRef.current);
    },
    [onMetricsUpdate],
  );

  /**
   * Get elapsed time in formatted string
   */
  const getElapsedTimeString = useCallback((): string => {
    const seconds = metricsRef.current.durationSeconds;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Get current metrics
   */
  const getMetrics = useCallback((): SessionMetrics => {
    return { ...metricsRef.current };
  }, []);

  /**
   * Calculate MET-based calories for non-cycling activities
   */
  const calculateCalories = useCallback(
    (durationHours: number, metValue?: number): number => {
      const metMap = {
        [ActivityTypeValues.WALKING]: 3.5,
        [ActivityTypeValues.FAST_WALKING]: 5.0,
        [ActivityTypeValues.RUNNING]: 9.8,
        [ActivityTypeValues.CYCLING]: 8.0,
      } as Record<ActivityType, number>;

      const met = metValue || metMap[activityType];
      return Math.round(met * userWeight * durationHours);
    },
    [activityType, userWeight],
  );

  /**
   * Estimate distance from steps
   */
  const estimateDistanceFromSteps = useCallback((steps: number): number => {
    const strideLength = 0.75; // meters
    return (steps * strideLength) / 1000; // km
  }, []);

  return {
    // State
    state,
    isRunning: state === SessionStateValues.RUNNING,
    isPaused: state === SessionStateValues.PAUSED,
    isStopped: state === SessionStateValues.STOPPED,
    sessionId,

    // Actions
    start,
    pause,
    resume,
    stop,
    updateMetrics,
    setMetric,

    // Getters
    getMetrics,
    getElapsedTimeString,

    // Utilities
    calculateCalories,
    estimateDistanceFromSteps,
  };
};
