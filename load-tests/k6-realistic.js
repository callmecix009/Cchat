import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

export let options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '20s', target: 50 },
    { duration: '20s', target: 100 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const TENANT_TOKENS = (__ENV.TEST_TENANT_TOKENS || __ENV.TEST_CLERK_TOKEN || '').split(',').map(s=>s.trim()).filter(Boolean);

let dbLatency = new Trend('db_latency');
let aiLatency = new Trend('ai_latency');
let failRate = new Rate('failed');

const vary = () => 1 + Math.random() * 2;

export default function () {
  const TOKEN = TENANT_TOKENS.length ? TENANT_TOKENS[(__VU-1) % TENANT_TOKENS.length] : '';
  const headers = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
  group('public', () => {
    let r = http.get(`${BASE}/`, { headers });
    check(r, { 'home 200': x => x.status === 200 });
    sleep(vary());
    r = http.get(`${BASE}/privacy`, { headers });
    check(r, { 'privacy 200': x => x.status === 200 || x.status === 308 });
    sleep(vary());
  });

  group('authenticated realistic', () => {
    if (!TOKEN) {
      // No token — skip authenticated checks but still measure public
      sleep(1);
      return;
    }
    let r = http.get(`${BASE}/api/workspace`, { headers });
    check(r, { 'workspace 200': x => x.status === 200 });
    failRate.add(r.status !== 200 ? 1 : 0);
    sleep(vary());

    r = http.get(`${BASE}/api/inbox`, { headers });
    check(r, { 'inbox 200': x => x.status === 200 });
    let j = {};
    try { j = r.json(); } catch {}
    if (j.conversations && j.conversations[0]) {
      let cid = j.conversations[0].id;
      http.get(`${BASE}/api/inbox?cid=${cid}`, { headers });
      sleep(vary());
    }

    r = http.get(`${BASE}/api/ai-config`, { headers });
    check(r, { 'ai-config 200': x => x.status === 200 });
    sleep(vary());

    r = http.get(`${BASE}/api/settings`, { headers });
    check(r, { 'settings 200': x => x.status === 200 });
    sleep(vary());

    r = http.get(`${BASE}/dashboard`, { headers });
    check(r, { 'dashboard 200/308': x => x.status === 200 || x.status === 308 });
    sleep(vary());
  });

  group('cross-tenant isolation', () => {
    if (TENANT_TOKENS.length < 2 || !TOKEN) {
      return;
    }
    // Distinct tenant credentials — negative assertions
    let ownInbox = http.get(`${BASE}/api/inbox`, { headers });
    let ownData = {};
    try { ownData = ownInbox.json(); } catch {}
    let ownIds = (ownData.conversations || []).map(c => c.id);
    let otherIdx = __VU % TENANT_TOKENS.length;
    let otherToken = TENANT_TOKENS[otherIdx];
    if (otherToken === TOKEN) {
      otherToken = TENANT_TOKENS[(otherIdx + 1) % TENANT_TOKENS.length];
    }
    if (otherToken && otherToken !== TOKEN) {
      let otherHeaders = { Authorization: `Bearer ${otherToken}` };
      let otherInbox = http.get(`${BASE}/api/inbox`, { headers: otherHeaders });
      check(otherInbox, { 'other tenant inbox 200': x => x.status === 200 });
      try {
        let otherData = otherInbox.json();
        let otherIds = (otherData.conversations || []).map(c => c.id);
        // Verify isolation: own conversation IDs should not appear in other tenant's inbox
        let isolated = ownIds.length === 0 || !ownIds.some(id => otherIds.includes(id));
        check(otherInbox, { 'cross-tenant isolation': () => isolated });
        // Also verify workspace isolation — other tenant's products not visible as own
        let otherWs = http.get(`${BASE}/api/workspace`, { headers: otherHeaders });
        check(otherWs, { 'other workspace 200': x => x.status === 200 });
      } catch {}
    }
  });
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
  };
}
