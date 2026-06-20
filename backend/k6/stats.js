import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';

function getAuthToken() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'demo@fit.com',
    password: 'demo123',
  }), { headers: { 'Content-Type': 'application/json' } });

  return loginRes.json('accessToken');
}

const endpoints = [
  'daily',
  'weekly',
  'monthly',
  'streak',
  'activity-breakdown',
];

export default function () {
  const token = getAuthToken();
  if (!token) return;

  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  endpoints.forEach((endpoint) => {
    const res = http.get(`${BASE_URL}/stats/${endpoint}`, { headers });

    check(res, {
      [`${endpoint} status 200`]: (r) => r.status === 200,
    });
  });

  sleep(1);
}
