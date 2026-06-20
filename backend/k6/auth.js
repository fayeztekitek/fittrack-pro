import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

export default function () {
  const email = `perf-test-${Date.now()}-${__VU}@example.com`;

  const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    email,
    password: 'PerfTest123!',
    name: `Perf User ${__VU}`,
    weightKg: 70,
    heightCm: 175,
    age: 30,
    gender: 'male',
    stepGoal: 10000,
  }), { headers: { 'Content-Type': 'application/json' } });

  check(registerRes, {
    'register status 201': (r) => r.status === 201,
    'register has access token': (r) => r.json('accessToken') !== '',
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email,
    password: 'PerfTest123!',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, {
    'login status 200': (r) => r.status === 200,
    'login has access token': (r) => r.json('accessToken') !== '',
    'login has refresh token': (r) => r.json('refreshToken') !== '',
  });

  const refreshToken = loginRes.json('refreshToken');

  if (refreshToken) {
    const refreshRes = http.post(`${BASE_URL}/auth/refresh`, JSON.stringify({
      refreshToken,
    }), { headers: { 'Content-Type': 'application/json' } });

    check(refreshRes, {
      'refresh status 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
