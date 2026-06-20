import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  StopCircle,
  MapPin,
  Heart,
  Zap,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import {
  useGpsTracker,
  useStepCounter,
  useCyclingPower,
  useActivitySession,
  useActivitySim,
} from '../hooks';
import { activityApiService } from '../services';
import { ActivityTypeValues, ACTIVITY_ICONS } from '../types/activity.types';
import type { ActivityType } from '../types/activity.types';
import { useAuthStore } from '../stores/authStore';
import { GpsMap } from '../components/track/GpsMap';
import { CyclingSegments } from '../components/track/CyclingSegments';

export const TrackingPage: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType>(
    ActivityTypeValues.RUNNING as ActivityType,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);
  const [segments, setSegments] = useState<{ km: number; speed: number; time: number }[]>([]);
  const segDistRef = useRef(0);
  const segKmRef = useRef(0);

  // Session state
  const session = useActivitySession({
    activityType: selectedActivityType,
    userWeight: user?.profile?.weightKg || 70,
    onMetricsUpdate: () => {
      // Update UI with metrics
    },
  });

  // GPS tracking
  const gpsTracker = useGpsTracker({
    enabled: session.isRunning,
    batchSize: 50,
    batchInterval: 30000,
    onBatchReady: async (points) => {
      if (session.sessionId) {
        try {
          await activityApiService.submitGPSPoints(session.sessionId, {
            points: points.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
              elevation: p.elevation,
              speedKmh: p.speedKmh,
              accuracyM: p.accuracyM,
              bearingDegrees: p.bearingDegrees,
              timestamp: p.timestamp,
            })),
          });
        } catch (err) {
          console.error('Failed to submit GPS points:', err);
        }
      }
    },
    onError: (err) => {
      setError(`GPS Error: ${err.message}`);
    },
  });

  // Step counter
  const stepCounter = useStepCounter({
    enabled: session.isRunning,
    onStepsChanged: (steps) => {
      session.setMetric('totalSteps', steps);
      // Estimate distance from steps
      const distance = session.estimateDistanceFromSteps(steps);
      session.setMetric('distanceKm', distance);
    },
    onCadenceChanged: (rpm) => {
      if (selectedActivityType === ActivityTypeValues.CYCLING) {
        session.setMetric('avgCadenceRpm', rpm);
      }
    },
    onError: (error) => {
      setError(`Step Counter Error: ${error}`);
    },
  });

  // Cycling power (only for cycling)
  const powerMeter = useCyclingPower({
    enabled: session.isRunning && selectedActivityType === ActivityTypeValues.CYCLING,
    weightKg: user?.profile?.weightKg || 70,
    onPowerChanged: (watts) => {
      session.setMetric('avgPowerWatts', watts);
    },
  });

  // Simulation fallback (when no real sensors)
  useActivitySim({
    enabled: session.isRunning && useSimulation,
    activityType: selectedActivityType,
    onMetricsUpdate: (sim) => {
      session.setMetric('distanceKm', sim.distanceKm);
      session.setMetric('avgSpeedKmh', sim.speedKmh);
      if (selectedActivityType === ActivityTypeValues.CYCLING) {
        session.setMetric('avgCadenceRpm', sim.cadenceRpm);
      }
    },
  });

  // Track cycling 1km segments
  const prevDistRef = useRef(0);
  const segStartRef = useRef(Date.now());
  React.useEffect(() => {
    if (!session.isRunning || selectedActivityType !== ActivityTypeValues.CYCLING) {
      segKmRef.current = 0;
      segDistRef.current = 0;
      prevDistRef.current = 0;
      return;
    }
    const currentDist = session.getMetrics().distanceKm;
    const delta = currentDist - prevDistRef.current;
    segDistRef.current += delta;
    prevDistRef.current = currentDist;

    if (segDistRef.current >= 1.0) {
      segKmRef.current++;
      const elapsed = (Date.now() - segStartRef.current) / 1000;
      const speed = 1.0 / (elapsed / 3600);
      const newSeg = { km: segKmRef.current, speed: Math.round(speed * 10) / 10, time: Math.round(elapsed) };
      setSegments((prev) => [...prev, newSeg]);
      segDistRef.current = 0;
      segStartRef.current = Date.now();
    }
  }, [session.isRunning, selectedActivityType, session.getMetrics().distanceKm]);

  /**
   * Start activity
   */
  const handleStart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const elevation = gpsTracker.isTracking
        ? gpsTracker.accuracy || 0
        : undefined;

      const response = await activityApiService.startActivity({
        type: selectedActivityType,
        elevationStartM: elevation,
        notes: `${ACTIVITY_ICONS[selectedActivityType]} Activity started`,
      });

      await session.start(response.id);
    } catch (err: any) {
      setError(err.message || 'Failed to start activity');
      console.error('Start activity error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Pause/Resume activity
   */
  const handlePauseResume = () => {
    if (session.isRunning) {
      session.pause();
    } else if (session.isPaused) {
      session.resume();
    }
  };

  /**
   * Stop activity
   */
  const handleStop = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!session.sessionId) {
        throw new Error('No active session');
      }

      const currentMetrics = session.getMetrics();

      // Calculate final calories
      const durationHours = currentMetrics.durationSeconds / 3600;
      const calories = session.calculateCalories(durationHours);

      // If GPS was available, use actual distance, otherwise estimate from steps
      const finalDistance =
        currentMetrics.distanceKm > 0
          ? currentMetrics.distanceKm
          : session.estimateDistanceFromSteps(currentMetrics.totalSteps);

      await activityApiService.stopActivity(session.sessionId, {
        durationSeconds: currentMetrics.durationSeconds,
        distanceKm: finalDistance,
        caloriesBurned: calories,
        totalSteps: currentMetrics.totalSteps,
        maxSpeedKmh: currentMetrics.maxSpeedKmh,
        avgSpeedKmh:
          finalDistance > 0
            ? (finalDistance / (currentMetrics.durationSeconds / 3600)) * 1
            : 0,
        elevationGainM: currentMetrics.elevationGainM,
        avgPowerWatts:
          selectedActivityType === ActivityTypeValues.CYCLING
            ? powerMeter.avgPowerWatts
            : undefined,
        maxPowerWatts:
          selectedActivityType === ActivityTypeValues.CYCLING
            ? powerMeter.maxPowerWatts
            : undefined,
        avgCadenceRpm:
          selectedActivityType === ActivityTypeValues.CYCLING
            ? currentMetrics.avgCadenceRpm
            : undefined,
      });

      await session.stop();

      // Reset all counters
      stepCounter.reset();
      powerMeter.reset();
    } catch (err: any) {
      setError(err.message || 'Failed to stop activity');
      console.error('Stop activity error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isActivitySelected = session.sessionId !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-3xl font-bold text-white mb-2">Activity Tracking</h1>
          <p className="text-slate-400">
            {session.isRunning
              ? '🟢 Recording activity...'
              : session.isPaused
                ? '⏸️ Activity paused'
                : '⚪ Ready to start'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Activity type selector */}
        {!isActivitySelected && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(ActivityTypeValues).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedActivityType(type)}
                  className={`p-4 rounded-xl border-2 transition ${
                    selectedActivityType === type
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{ACTIVITY_ICONS[type]}</div>
                  <div className="text-sm font-semibold capitalize">{type.replace('_', ' ')}</div>
                </button>
              ))}
            </div>

            {/* Simulation toggle */}
            <button
              onClick={() => setUseSimulation(!useSimulation)}
              className={`w-full py-2 px-4 rounded-xl border text-sm font-semibold transition ${
                useSimulation
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400'
              }`}
            >
              {useSimulation ? '🟢 Simulation Mode' : 'Use Simulation Fallback'}
            </button>
          </>
        )}

        {/* Live metrics display */}
        {isActivitySelected && (
          <div className="space-y-4">
            {/* Timer */}
            <div className="text-center p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700">
              <div className="text-5xl font-mono font-bold text-emerald-400 mb-2">
                {session.getElapsedTimeString()}
              </div>
              <div className="text-sm text-slate-400">Elapsed Time</div>
            </div>

            {/* Key metrics grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Distance */}
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-blue-400" />
                  <span className="text-xs text-slate-400">Distance</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {session.getMetrics().distanceKm.toFixed(2)}
                  <span className="text-sm text-slate-400 ml-1">km</span>
                </div>
              </div>

              {/* Calories */}
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-orange-400" />
                  <span className="text-xs text-slate-400">Calories</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {Math.round(
                    session.calculateCalories(session.getMetrics().durationSeconds / 3600),
                  )}
                  <span className="text-sm text-slate-400 ml-1">kcal</span>
                </div>
              </div>

              {/* Steps */}
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-purple-400" />
                  <span className="text-xs text-slate-400">Steps</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {session.getMetrics().totalSteps}
                  <span className="text-sm text-slate-400 ml-1">steps</span>
                </div>
              </div>

              {/* Speed */}
              <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <Heart size={16} className="text-red-400" />
                  <span className="text-xs text-slate-400">Avg Speed</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {gpsTracker.currentSpeed.toFixed(1)}
                  <span className="text-sm text-slate-400 ml-1">km/h</span>
                </div>
              </div>
            </div>

            {/* Cycling-specific metrics */}
            {selectedActivityType === ActivityTypeValues.CYCLING && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={16} className="text-yellow-400" />
                    <span className="text-xs text-slate-400">Power</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {powerMeter.avgPowerWatts}
                    <span className="text-sm text-slate-400 ml-1">W</span>
                  </div>
                  {powerMeter.currentPowerZone && (
                    <div className="text-xs text-slate-400 mt-1">
                      Zone {powerMeter.currentPowerZone.zone}:{' '}
                      {powerMeter.currentPowerZone.label}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-pink-400" />
                    <span className="text-xs text-slate-400">Cadence</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {session.getMetrics().avgCadenceRpm || 0}
                    <span className="text-sm text-slate-400 ml-1">rpm</span>
                  </div>
                </div>
              </div>
            )}

            {/* GPS Route Map */}
            {gpsTracker.routePoints.length >= 2 && (
              <GpsMap points={gpsTracker.routePoints} width={400} height={200} />
            )}

            {/* Cycling 1km Segments */}
            {selectedActivityType === ActivityTypeValues.CYCLING && segments.length > 0 && (
              <CyclingSegments segments={segments} />
            )}

            {/* GPS Status */}
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 flex items-center justify-between text-sm">
              <span className="text-slate-400">GPS Status</span>
              <div className="flex items-center gap-2">
                {gpsTracker.isTracking ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-400">Not Connected</span>
                  </>
                )}
              </div>
            </div>

            {useSimulation && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs text-center">
                Simulation active — using virtual sensor data
              </div>
            )}
          </div>
        )}

        {/* Control buttons */}
        <div className="flex gap-3 fixed bottom-20 left-4 right-4">
          {!isActivitySelected ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-800/40 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Play size={20} />
                  Start
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={handlePauseResume}
                className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                {session.isRunning ? (
                  <>
                    <Pause size={20} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleStop}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-red-800/40 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <StopCircle size={20} />
                    Stop
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
