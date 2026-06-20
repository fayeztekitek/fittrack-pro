import { useRef, useState, useCallback } from 'react';

export interface UseCyclingPowerOptions {
  enabled: boolean;
  weightKg: number;
  onPowerChanged?: (watts: number, zone: { zone: number; label: string }) => void;
  onError?: (error: string) => void;
}

interface PowerZone {
  zone: number;
  label: string;
  minWatts: number;
  maxWatts: number;
}

export const useCyclingPower = (options: UseCyclingPowerOptions) => {
  const { weightKg, onPowerChanged } = options;

  const [avgPowerWatts, setAvgPowerWatts] = useState(0);
  const [maxPowerWatts, setMaxPowerWatts] = useState(0);
  const [currentPowerZone, setCurrentPowerZone] = useState<PowerZone | null>(
    null,
  );

  const powerBufferRef = useRef<number[]>([]);
  const sessionStartRef = useRef<Date>(new Date());

  /**
   * Calculate cycling power using physics formula
   * P = (Crr*m*g + 0.5*Cd*A*ρ*v²) * v
   *
   * Where:
   *   Crr = 0.004 (rolling resistance)
   *   m = weight in kg
   *   g = 9.81 m/s²
   *   Cd = 1.15 (drag coefficient for cyclist)
   *   A = 0.5 m² (frontal area)
   *   ρ = 1.225 kg/m³ (air density)
   *   v = speed in m/s
   *   gradient = elevation gradient (0 for flat, positive for uphill)
   */
  const calculatePower = useCallback(
    (speedMsec: number, elevationGradient: number = 0): number => {
      const g = 9.81;
      const Crr = 0.004;
      const Cd = 1.15;
      const A = 0.5;
      const rho = 1.225;

      const rollingResistance = Crr * weightKg * g;
      const aerodynamicDrag =
        0.5 * Cd * A * rho * Math.pow(speedMsec, 2);
      const gravitationalForce = weightKg * g * elevationGradient;

      const totalForce =
        rollingResistance + aerodynamicDrag + gravitationalForce;
      const power = totalForce * speedMsec;

      return Math.max(0, Math.round(power));
    },
    [weightKg],
  );

  /**
   * Classify power into training zone (1-6) based on FTP
   * FTP (Functional Threshold Power) estimated as 3.5W/kg
   */
  const getPowerZone = useCallback(
    (watts: number): PowerZone => {
      const ftp = weightKg * 3.5;
      const percentage = (watts / ftp) * 100;

      if (percentage < 56) {
        return {
          zone: 1,
          label: 'Recovery',
          minWatts: 0,
          maxWatts: Math.round(ftp * 0.56),
        };
      } else if (percentage < 76) {
        return {
          zone: 2,
          label: 'Endurance',
          minWatts: Math.round(ftp * 0.56),
          maxWatts: Math.round(ftp * 0.76),
        };
      } else if (percentage < 90) {
        return {
          zone: 3,
          label: 'Tempo',
          minWatts: Math.round(ftp * 0.76),
          maxWatts: Math.round(ftp * 0.9),
        };
      } else if (percentage < 104) {
        return {
          zone: 4,
          label: 'Threshold',
          minWatts: Math.round(ftp * 0.9),
          maxWatts: Math.round(ftp * 1.04),
        };
      } else if (percentage < 121) {
        return {
          zone: 5,
          label: 'VO2 Max',
          minWatts: Math.round(ftp * 1.04),
          maxWatts: Math.round(ftp * 1.21),
        };
      } else {
        return {
          zone: 6,
          label: 'Anaerobic',
          minWatts: Math.round(ftp * 1.21),
          maxWatts: 2000, // Arbitrary max
        };
      }
    },
    [weightKg],
  );

  /**
   * Update power metrics with new reading
   */
  const updatePower = useCallback(
    (speedMsec: number, elevationGradient?: number) => {
      const watts = calculatePower(speedMsec, elevationGradient);
      powerBufferRef.current.push(watts);

      // Keep last 60 readings for average
      if (powerBufferRef.current.length > 60) {
        powerBufferRef.current.shift();
      }

      const avg = Math.round(
        powerBufferRef.current.reduce((a, b) => a + b, 0) /
          powerBufferRef.current.length,
      );
      const max = Math.max(...powerBufferRef.current);

      setAvgPowerWatts(avg);
      setMaxPowerWatts(max);

      const zone = getPowerZone(avg);
      setCurrentPowerZone(zone);

      if (onPowerChanged) {
        onPowerChanged(avg, zone);
      }

      return watts;
    },
    [calculatePower, getPowerZone, onPowerChanged],
  );

  /**
   * Reset power meter
   */
  const reset = useCallback(() => {
    setAvgPowerWatts(0);
    setMaxPowerWatts(0);
    setCurrentPowerZone(null);
    powerBufferRef.current = [];
    sessionStartRef.current = new Date();
  }, []);

  return {
    avgPowerWatts,
    maxPowerWatts,
    currentPowerZone,
    calculatePower,
    getPowerZone,
    updatePower,
    reset,
  };
};
