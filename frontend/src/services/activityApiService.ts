import axios from 'axios';
import type { Activity, ActivitySegment, Achievement, ActivityType, GPSPoint } from '../types/activity.types';

const API_BASE = '/api';

export interface StartActivityRequest {
  type: ActivityType;
  elevationStartM?: number;
  notes?: string;
}

export interface StopActivityRequest {
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
  metadata?: Record<string, any>;
}

export interface BatchGPSPointRequest {
  points: {
    latitude: number;
    longitude: number;
    elevation?: number;
    speedKmh?: number;
    accuracyM?: number;
    bearingDegrees?: number;
    timestamp: string;
  }[];
}

export interface ActivitySegmentRequest {
  segmentNumber: number;
  durationSeconds: number;
  distanceKm: number;
  avgSpeedKmh: number;
  avgPowerWatts?: number;
  maxPowerWatts?: number;
  avgCadenceRpm?: number;
  caloriesBurned: number;
  elevationGainM?: number;
  startedAt: string;
  endedAt: string;
}

class ActivityApiService {
  /**
   * Start a new activity session
   */
  async startActivity(data: StartActivityRequest): Promise<Activity> {
    const response = await axios.post<Activity>(
      `${API_BASE}/activities/start`,
      data,
    );
    return response.data;
  }

  /**
   * Stop an activity and finalize metrics
   */
  async stopActivity(
    activityId: string,
    data: StopActivityRequest,
  ): Promise<Activity> {
    const response = await axios.patch<Activity>(
      `${API_BASE}/activities/${activityId}/stop`,
      data,
    );
    return response.data;
  }

  /**
   * Get single activity with full data
   */
  async getActivity(activityId: string): Promise<Activity> {
    const response = await axios.get<Activity>(
      `${API_BASE}/activities/${activityId}`,
    );
    return response.data;
  }

  /**
   * List user activities with pagination and filtering
   */
  async listActivities(options?: {
    take?: number;
    skip?: number;
    type?: ActivityType;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{ data: Activity[]; total: number; take: number; skip: number }> {
    const params = new URLSearchParams();
    if (options?.take) params.append('take', options.take.toString());
    if (options?.skip) params.append('skip', options.skip.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.fromDate) params.append('fromDate', options.fromDate.toISOString());
    if (options?.toDate) params.append('toDate', options.toDate.toISOString());

    const response = await axios.get(
      `${API_BASE}/activities?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Batch submit GPS points
   */
  async submitGPSPoints(
    activityId: string,
    data: BatchGPSPointRequest,
  ): Promise<GPSPoint[]> {
    const response = await axios.post<GPSPoint[]>(
      `${API_BASE}/activities/${activityId}/gps-points`,
      data,
    );
    return response.data;
  }

  /**
   * Get complete GPS trace for an activity
   */
  async getGPSTrace(activityId: string): Promise<GPSPoint[]> {
    const response = await axios.get<GPSPoint[]>(
      `${API_BASE}/activities/${activityId}/gps-trace`,
    );
    return response.data;
  }

  /**
   * Record an activity segment (1km split)
   */
  async recordSegment(
    activityId: string,
    data: ActivitySegmentRequest,
  ): Promise<ActivitySegment> {
    const response = await axios.post<ActivitySegment>(
      `${API_BASE}/activities/${activityId}/segments`,
      data,
    );
    return response.data;
  }

  /**
   * Get user's achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    const response = await axios.get<Achievement[]>(
      `${API_BASE}/activities/achievements/list`,
    );
    return response.data;
  }
}

// Export singleton instance
export const activityApiService = new ActivityApiService();
