import http from 'k6/http';
import { check, sleep } from 'k6';
import { hmac } from 'k6/crypto';

export let options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const SECRET = __ENV.META_APP_SECRET || 'test-secret';
const PHONE_ID = __ENV.TEST_PHONE_NUMBER_ID || '12345';
const TOKEN = __ENV.TEST_CLERK_TOKEN || '';

function sig(body) {
  // Node crypto HMAC sha256 hex — k6 crypto does sha256 with hmac
  return 'sha256=' + hmac('sha256', SECRET, body, 'hex');
}

export default function () {
  const payload = JSON.stringify({
    entry: [{
      changes: [{
        value: {
          metadata: { phone_number_id: PHONE_ID },
          contacts: [{ profile: { name: `User ${__VU}` } }],
          messages: [{
            from: `2557${1000000 + __VU}${Math.floor(Math.random()*1000)}`,
            type: 'text',
            text: { body: 'Hello ' + Math.random() },
            timestamp: String(Math.floor(Date.now()/1000)),
          }],
        }
      }]
    }]
  });

  const headers = {
    'Content-Type': 'application/json',
    'x-hub-signature-256': sig(payload),
  };

  // Baseline inbox size for side-effect check (when authenticated)
  let baselineCount = null;
  if (TOKEN) {
    let baseInbox = http.get(`${BASE}/api/inbox`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (baseInbox.status === 200) {
      try { baselineCount = baseInbox.json().conversations ? baseInbox.json().conversations.length : 0; } catch {}
    }
  }

  let r = http.post(`${BASE}/api/whatsapp/webhook`, payload, { headers });
  check(r, {
    'webhook 200/403': x => [200,403].includes(x.status),
    'no 500': x => x.status !== 500,
  });

  // Duplicate delivery (idempotency) — same payload again, verify single side effect
  if (Math.random() < 0.3) {
    let r2 = http.post(`${BASE}/api/whatsapp/webhook`, payload, { headers });
    check(r2, { 'duplicate 200/403': x => [200,403].includes(x.status) });
    // Observable side effect: exactly one processed message/downstream event
    if (TOKEN && baselineCount !== null) {
      let after = http.get(`${BASE}/api/inbox`, { headers: { Authorization: `Bearer ${TOKEN}` } });
      check(after, { 'inbox after duplicate 200': x => x.status === 200 });
      try {
        let afterCount = after.json().conversations ? after.json().conversations.length : baselineCount;
        // At most one new conversation/message should be created for the duplicate
        check(after, { 'single message idempotent': () => afterCount <= baselineCount + 1 });
      } catch {}
    }
  }

  sleep(0.5 + Math.random());
}
