import { useEffect, useRef, useState, useCallback } from 'react';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  elevation?: number;
  speedKmh?: number;
  accuracyM?: number;
  bearingDegrees?: number;
  timestamp: string;
}

export interface UseGpsTrackerOptions {
  enabled: boolean;
  batchSize?: number; // Submit every N points (default: 50)
  batchInterval?: number; // Or every N milliseconds (default: 30000ms = 30s)
  onBatchReady?: (points: GPSPoint[]) => Promise<void>;
  onError?: (error: GeolocationPositionError) => void;
}

export const useGpsTracker = (options: UseGpsTrackerOptions) => {
  const {
    enabled,
    batchSize = 50,
    batchInterval = 30000,
    onBatchReady,
    onError,
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const pointsBufferRef = useRef<GPSPoint[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Submit batch of GPS points to server
   */
  const submitBatch = useCallback(async () => {
    if (pointsBufferRef.current.length === 0) return;

    const batch = [...pointsBufferRef.current];
    pointsBufferRef.current = [];

    try {
      if (onBatchReady) {
        await onBatchReady(batch);
      }
    } catch (error) {
      console.error('Failed to submit GPS batch:', error);
      // Re-add points to buffer on failure (with max retries)
      pointsBufferRef.current = batch.concat(pointsBufferRef.current);
    }
  }, [onBatchReady]);

  /**
   * Handle new GPS position
   */
  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      const {
        latitude,
        longitude,
        altitude,
        accuracy: acc,
        heading,
        speed,
      } = position.coords;
      const timestamp = position.timestamp;

      setAccuracy(acc);
      setCurrentSpeed(speed ? speed * 3.6 : 0); // Convert m/s to km/h

      const point: GPSPoint = {
        latitude,
        longitude,
        elevation: altitude || undefined,
        speedKmh: speed ? speed * 3.6 : undefined,
        accuracyM: acc || undefined,
        bearingDegrees: heading || undefined,
        timestamp: new Date(timestamp).toISOString(),
      };

      pointsBufferRef.current.push(point);
      setRoutePoints((prev) => [...prev, { latitude, longitude }]);

      // Submit immediately if batch size reached
      if (pointsBufferRef.current.length >= batchSize) {
        submitBatch();
      }
    },
    [batchSize, submitBatch],
  );

  /**
   * Handle geolocation errors
   */
  const handleError = useCallback(
    (error: GeolocationPositionError) => {
      console.error('GPS Error:', error);
      if (onError) {
        onError(error);
      }
    },
    [onError],
  );

  /**
   * Start GPS tracking
   */
  useEffect(() => {
    if (!enabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
      setIsTracking(false);
      return;
    }

    // Request permission on iOS 13+
    if (
      navigator.permissions &&
      typeof (navigator.permissions as any).query === 'function'
    ) {
      (navigator.permissions as any)
        .query({ name: 'geolocation' })
        .then((permissionStatus: any) => {
          if (permissionStatus.state === 'denied') {
            console.warn('Geolocation permission denied');
            setIsTracking(false);
          } else {
            setIsTracking(true);
          }
        });
    } else {
      setIsTracking(true);
    }

    // Start watching position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      },
    );

    // Setup periodic batch submission
    batchTimerRef.current = setInterval(() => {
      submitBatch();
    }, batchInterval);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (batchTimerRef.current) {
        clearInterval(batchTimerRef.current);
      }
    };
  }, [enabled, handlePosition, handleError, submitBatch, batchInterval]);

  /**
   * Manual batch submission
   */
  const flushPoints = useCallback(() => {
    return submitBatch();
  }, [submitBatch]);

  return {
    isTracking,
    accuracy,
    currentSpeed,
    routePoints,
    bufferedPoints: pointsBufferRef.current.length,
    flushPoints,
  };
};
