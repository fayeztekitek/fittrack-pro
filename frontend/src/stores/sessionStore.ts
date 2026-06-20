import { create } from 'zustand';
import type { ActivityType } from '../types/activity.types';

interface SessionMetrics {
  durationSeconds: number;
  distanceKm: number;
  caloriesBurned: number;
  totalSteps: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  elevationGainM: number;
  avgPowerWatts: number;
  maxPowerWatts: number;
  avgCadenceRpm: number;
  maxHeartRate: number;
  avgHeartRate: number;
}

interface SessionState {
  sessionId: string | null;
  activityType: ActivityType | null;
  isRunning: boolean;
  isPaused: boolean;
  startedAt: string | null;
  metrics: SessionMetrics;
  setSessionId: (id: string | null) => void;
  setActivityType: (type: ActivityType | null) => void;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setStartedAt: (at: string | null) => void;
  updateMetrics: (partial: Partial<SessionMetrics>) => void;
  reset: () => void;
}

const initialMetrics: SessionMetrics = {
  durationSeconds: 0,
  distanceKm: 0,
  caloriesBurned: 0,
  totalSteps: 0,
  maxSpeedKmh: 0,
  avgSpeedKmh: 0,
  elevationGainM: 0,
  avgPowerWatts: 0,
  maxPowerWatts: 0,
  avgCadenceRpm: 0,
  maxHeartRate: 0,
  avgHeartRate: 0,
};

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  activityType: null,
  isRunning: false,
  isPaused: false,
  startedAt: null,
  metrics: { ...initialMetrics },
  setSessionId: (id) => set({ sessionId: id }),
  setActivityType: (type) => set({ activityType: type }),
  setRunning: (running) => set({ isRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setStartedAt: (at) => set({ startedAt: at }),
  updateMetrics: (partial) =>
    set((state) => ({
      metrics: { ...state.metrics, ...partial },
    })),
  reset: () =>
    set({
      sessionId: null,
      activityType: null,
      isRunning: false,
      isPaused: false,
      startedAt: null,
      metrics: { ...initialMetrics },
    }),
}));
