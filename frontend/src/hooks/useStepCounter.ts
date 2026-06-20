import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseStepCounterOptions {
  enabled: boolean;
  onStepsChanged?: (steps: number) => void;
  onCadenceChanged?: (rpm: number) => void;
  onError?: (error: string) => void;
}

/**
 * Step counter using DeviceMotion accelerometer
 * Algorithm: Low-pass gravity filter + peak detection + debounce
 */
export const useStepCounter = (options: UseStepCounterOptions) => {
  const {
    enabled,
    onStepsChanged,
    onCadenceChanged,
    onError,
  } = options;

  const [steps, setSteps] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [cadenceRpm, setCadenceRpm] = useState(0);

  // Filter state
  const gravityRef = useRef([0, 0, 0]);
  const linearAccelRef = useRef([0, 0, 0]);
  const movingAverageRef = useRef<number[]>([]);
  const lastStepTimeRef = useRef(0);

  // Cycling cadence
  const cyclingPeaksRef = useRef<number[]>([]);
  const cyclingWindowStartRef = useRef(Date.now());

  const ALPHA = 0.8; // Low-pass filter coefficient
  const PEAK_THRESHOLD = 2.2; // m/s² for step detection
  const DEBOUNCE_MS = 250; // Minimum time between steps
  const MOVING_AVG_WINDOW = 4;
  const CYCLING_WINDOW_MS = 4000; // 4s window for cadence calculation

  /**
   * Low-pass filter for gravity separation
   */
  const updateGravity = useCallback(
    (accelX: number, accelY: number, accelZ: number) => {
      gravityRef.current[0] =
        ALPHA * gravityRef.current[0] + (1 - ALPHA) * accelX;
      gravityRef.current[1] =
        ALPHA * gravityRef.current[1] + (1 - ALPHA) * accelY;
      gravityRef.current[2] =
        ALPHA * gravityRef.current[2] + (1 - ALPHA) * accelZ;

      // Calculate linear acceleration (total - gravity)
      linearAccelRef.current[0] = accelX - gravityRef.current[0];
      linearAccelRef.current[1] = accelY - gravityRef.current[1];
      linearAccelRef.current[2] = accelZ - gravityRef.current[2];
    },
    [],
  );

  /**
   * Detect step via peak detection on moving average
   */
  const detectStep = useCallback(
    (magnitude: number): boolean => {
      const now = Date.now();

      // Moving average window
      movingAverageRef.current.push(magnitude);
      if (movingAverageRef.current.length > MOVING_AVG_WINDOW) {
        movingAverageRef.current.shift();
      }

      const movingAvg =
        movingAverageRef.current.reduce((a, b) => a + b, 0) /
        movingAverageRef.current.length;

      // Peak detection: check if magnitude exceeds threshold and time since last step
      const isNewPeak = movingAvg > PEAK_THRESHOLD;
      const enoughTimePassed = now - lastStepTimeRef.current > DEBOUNCE_MS;

      if (isNewPeak && enoughTimePassed) {
        lastStepTimeRef.current = now;
        return true;
      }

      return false;
    },
    [],
  );

  /**
   * Detect cycling cadence (pedaling rhythm)
   */
  const detectCyclingCadence = useCallback((magnitude: number) => {
    const now = Date.now();
    const windowAge = now - cyclingWindowStartRef.current;

    // Reset window if expired
    if (windowAge > CYCLING_WINDOW_MS) {
      cyclingPeaksRef.current = [];
      cyclingWindowStartRef.current = now;
    }

    // Record peak if exceeds threshold
    if (magnitude > PEAK_THRESHOLD) {
      cyclingPeaksRef.current.push(now);
    }

    // Calculate RPM: peaks per 4s → peaks per minute
    // RPM = (peaks / 4s) * 60s = peaks * 15
    const rpm = cyclingPeaksRef.current.length * 15;

    if (onCadenceChanged && rpm > 0) {
      onCadenceChanged(rpm);
    }

    return rpm;
  }, [onCadenceChanged]);

  /**
   * Handle DeviceMotion event
   */
  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const accel = event.acceleration;
      if (!accel) return;

      const x = accel.x ?? 0;
      const y = accel.y ?? 0;
      const z = accel.z ?? 0;

      // Apply gravity filter
      updateGravity(x, y, z);

      // Calculate magnitude of linear acceleration
      const magnitude = Math.sqrt(
        linearAccelRef.current[0] ** 2 +
          linearAccelRef.current[1] ** 2 +
          linearAccelRef.current[2] ** 2,
      );

      // Detect step
      if (detectStep(magnitude)) {
        setSteps((prev) => {
          const newSteps = prev + 1;
          if (onStepsChanged) {
            onStepsChanged(newSteps);
          }
          return newSteps;
        });
      }

      // Detect cycling cadence
      detectCyclingCadence(magnitude);
    },
    [updateGravity, detectStep, detectCyclingCadence, onStepsChanged],
  );

  /**
   * Request DeviceMotion permission (iOS 13+)
   */
  const requestPermission = useCallback(async () => {
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setIsActive(true);
        } else {
          if (onError) {
            onError('DeviceMotion permission denied');
          }
        }
      } catch {
        if (onError) {
          onError('Failed to request DeviceMotion permission');
        }
      }
    } else {
      // Android or non-iOS devices
      setIsActive(true);
    }
  }, [onError]);

  /**
   * Setup/teardown motion tracking
   */
  useEffect(() => {
    if (!enabled) {
      window.removeEventListener('devicemotion', handleMotion);
      setIsActive(false);
      return;
    }

    // Request permission and start listening
    requestPermission().then(() => {
      window.addEventListener('devicemotion', handleMotion);
    });

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [enabled, handleMotion, requestPermission]);

  /**
   * Reset step counter
   */
  const reset = useCallback(() => {
    setSteps(0);
    setCadenceRpm(0);
    movingAverageRef.current = [];
    cyclingPeaksRef.current = [];
    lastStepTimeRef.current = Date.now();
  }, []);

  return {
    steps,
    cadenceRpm,
    isActive,
    reset,
  };
};
