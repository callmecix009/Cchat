import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export let options = {
  stages: [
    { duration: '20s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 25 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<8000'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TEST_CLERK_TOKEN || '';
let aiLatency = new Trend('ai_latency');
let rateLimited = new Rate('rate_limited');

export default function () {
  if (!TOKEN) {
    // Without token, test that unauthed is 401 and does not leak key
    let r = http.post(`${BASE}/api/chat`, JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }), { headers: { 'Content-Type': 'application/json' } });
    check(r, { 'chat 401 without token': x => x.status === 401 });
    sleep(2);
    return;
  }
  const payload = JSON.stringify({
    messages: [{ role: 'user', content: 'Bei ya Galaxy A54? Kuna rangi gani?' }],
    mode: 'business',
  });
  const start = Date.now();
  let r = http.post(`${BASE}/api/chat`, payload, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` } });
  let dur = Date.now() - start;
  aiLatency.add(dur);
  if (r.status === 429) rateLimited.add(1); else rateLimited.add(0);
  check(r, {
    'chat 200/429/503': x => [200,429,503].includes(x.status),
    'no 500': x => x.status !== 500,
    'reply present if 200': x => x.status !== 200 || (()=>{ try{ return !!x.json().reply; }catch{ return false; } })(),
  });
  // Ensure one slow AI does not block: follow with quick workspace fetch
  sleep(1);
  let r2 = http.get(`${BASE}/api/workspace`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  check(r2, { 'workspace after ai 200': x => x.status === 200 });
  sleep(1 + Math.random());
}
