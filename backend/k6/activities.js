import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

function getAuthToken() {
  const email = `perf-act-${Date.now()}@example.com`;
  http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    email,
    password: 'PerfTest123!',
    name: 'Perf Activities User',
    weightKg: 70,
    heightCm: 175,
    age: 30,
    gender: 'male',
    stepGoal: 10000,
  }), { headers: { 'Content-Type': 'application/json' } });

  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email,
    password: 'PerfTest123!',
  }), { headers: { 'Content-Type': 'application/json' } });

  return loginRes.json('accessToken');
}

export default function () {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const startRes = http.post(`${BASE_URL}/activities/start`, JSON.stringify({
    type: 'RUNNING',
  }), { headers });

  check(startRes, {
    'start activity status 201': (r) => r.status === 201,
    'start has activity id': (r) => r.json('id') !== '',
  });

  const activityId = startRes.json('id');

  if (activityId) {
    const stopRes = http.patch(`${BASE_URL}/activities/${activityId}/stop`, JSON.stringify({
      durationSeconds: 1800,
      distanceKm: 8.5,
      caloriesBurned: 520,
      totalSteps: 8500,
      maxSpeedKmh: 12.5,
      avgSpeedKmh: 10.2,
      elevationGainM: 45,
      avgHeartRate: 145,
      maxHeartRate: 172,
      avgPowerWatts: 0,
      maxPowerWatts: 0,
      avgCadenceRpm: 0,
    }), { headers });

    check(stopRes, {
      'stop activity status 200': (r) => r.status === 200,
    });
  }

  sleep(2);
}
