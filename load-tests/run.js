#!/usr/bin/env node
// Node fallback load test — no k6 binary required. Uses fetch concurrency.
// Usage: node load-tests/run.js --vus 50 --duration 20 --url http://localhost:3000

const { performance } = require('perf_hooks');

const args = process.argv.slice(2);
const getArg = (k, d) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 && args[i+1] ? args[i+1] : d;
};

const VUS = parseInt(getArg('vus', '10'), 10);
const DURATION = parseInt(getArg('duration', '20'), 10);
const BASE = getArg('url', process.env.BASE_URL || 'http://localhost:3000');
const TOKEN = process.env.TEST_CLERK_TOKEN || '';

async function hit(path, opts={}) {
  const url = BASE + path;
  const headers = { ...(opts.headers||{}) };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  const start = performance.now();
  try {
    const r = await fetch(url, { ...opts, headers, signal: controller.signal });
    clearTimeout(timeout);
    const dur = performance.now() - start;
    return { status: r.status, dur, ok: r.ok };
  } catch (e) {
    clearTimeout(timeout);
    const msg = String(e && e.message || e);
    const name = e && e.name || '';
    const isAbort = name === 'AbortError' || msg.includes('aborted') || msg.includes('TimeoutError');
    const isConnRefused = msg.includes('ECONNREFUSED') || msg.includes('fetch failed') || msg.includes('ECONNRESET');
    const dur = performance.now() - start;
    return { status: 0, dur, err: msg, ok: false, isAbort, isConnRefused };
  }
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b)=>a-b);
  const idx = Math.ceil(p/100 * s.length)-1;
  return s[Math.max(0, Math.min(idx, s.length-1))];
}

async function vuLoop(id, endAt, stats) {
  const pathsPublic = ['/', '/privacy', '/sitemap.xml'];
  const pathsAuth = ['/api/workspace', '/api/inbox', '/api/ai-config', '/api/settings'];
  while (Date.now() < endAt) {
    const isAuth = Math.random() < 0.6 && TOKEN;
    const path = isAuth ? pathsAuth[Math.floor(Math.random()*pathsAuth.length)] : pathsPublic[Math.floor(Math.random()*pathsPublic.length)];
    const res = await hit(path);
    stats.reqs++;
    stats.durs.push(res.dur);
    if (res.ok) stats.success++; else if (res.status>=400 && res.status<500) stats.c4xx++; else if (res.status>=500) stats.c5xx++;
    if (res.isAbort) stats.aborts = (stats.aborts||0)+1;
    else if (res.isConnRefused) stats.connRefused = (stats.connRefused||0)+1;
    else if (res.status===0) stats.timeouts = (stats.timeouts||0)+1;
    // small think time 300-1200ms
    await new Promise(r=>setTimeout(r, 300 + Math.random()*900));
  }
}

(async () => {
  console.log(`C-chat Node load test — ${VUS} VU for ${DURATION}s against ${BASE} ${TOKEN ? '(auth)' : '(public only)'}`);
  const stats = { reqs:0, success:0, c4xx:0, c5xx:0, timeouts:0, aborts:0, connRefused:0, durs:[] };
  const endAt = Date.now() + DURATION*1000;
  const start = performance.now();
  const workers = Array.from({length: VUS}, (_,i)=>vuLoop(i, endAt, stats));
  await Promise.all(workers);
  const elapsed = (performance.now()-start)/1000;
  const rps = stats.reqs / elapsed;
  const p50 = percentile(stats.durs, 50), p90 = percentile(stats.durs,90), p95 = percentile(stats.durs,95), p99 = percentile(stats.durs,99);
  const avg = stats.durs.length? stats.durs.reduce((a,b)=>a+b,0)/stats.durs.length : 0;
  console.log(JSON.stringify({
    vus: VUS,
    duration: DURATION,
    base: BASE,
    requests: stats.reqs,
    rps: Number(rps.toFixed(2)),
    successRate: stats.reqs? (stats.success/stats.reqs).toFixed(4):0,
    c4xx: stats.c4xx, c5xx: stats.c5xx, timeouts: stats.timeouts, aborts: stats.aborts||0, connRefused: stats.connRefused||0,
    avg: Math.round(avg), p50: Math.round(p50), p90: Math.round(p90), p95: Math.round(p95), p99: Math.round(p99)
  }, null, 2));
})();
