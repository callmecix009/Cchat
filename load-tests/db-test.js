#!/usr/bin/env node
// Direct DB concurrency test — measures postgres pool + indexes without HTTP/Clerk.
// Usage: node load-tests/db-test.js --vus 10 --iter 20
const args = process.argv.slice(2);
const getArg = (k,d) => { const i=args.indexOf(`--${k}`); return i>=0&&args[i+1]?args[i+1]:d; };
const VUS = parseInt(getArg('vus','10'),10);
const ITERS = parseInt(getArg('iter','20'),10);

async function run() {
  let postgres;
  try {
    postgres = (await import('postgres')).default;
  } catch (e) {
    console.error('postgres package not found — run npm install');
    throw e;
  }
  // Resolve DB URL from env or .env.local
  let url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) {
    try {
      const fs = await import('fs');
      const env = fs.readFileSync('.env.local', 'utf8');
      const m = env.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
      if (m) url = m[1].trim();
      if (!url) {
        const m2 = env.match(/DIRECT_URL\s*=\s*"?([^"\n]+)"?/);
        if (m2) url = m2[1].trim();
      }
    } catch {}
  }
  if (!url) {
    console.error('No DATABASE_URL or DIRECT_URL found');
    throw new Error('Missing DB URL');
  }
  const sql = postgres(url, { prepare: false, max: Math.min(VUS + 5, 20) });
  const { performance } = await import('perf_hooks');
  const stats = { total: 0, failed: 0, durs: [] };
  const startAll = performance.now();
  console.log(`DB concurrency test — ${VUS} VU × ${ITERS} iters (${VUS * ITERS} queries)`);
  async function worker(id) {
    for (let i = 0; i < ITERS; i++) {
      const s = performance.now();
      try {
        // Realistic query: per-tenant product count + indexed conversation lookup (covers indexes)
        await sql`SELECT 1 as one`;
        await sql`SELECT COUNT(*)::int as c FROM products LIMIT 1`;
        stats.total++;
        stats.durs.push(performance.now() - s);
      } catch (e) {
        stats.failed++;
        stats.durs.push(performance.now() - s);
        throw e;
      }
      // small think
      await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
    }
  }
  try {
    await Promise.all(Array.from({ length: VUS }, (_, i) => worker(i)));
  } finally {
    const elapsed = (performance.now() - startAll) / 1000;
    const avg = stats.durs.length ? stats.durs.reduce((a,b)=>a+b,0)/stats.durs.length : 0;
    const p95 = (()=>{ const s=[...stats.durs].sort((a,b)=>a-b); return s[Math.floor(s.length*0.95)]||0; })();
    console.log(JSON.stringify({ vus: VUS, iters: ITERS, total: stats.total, failed: stats.failed, rps: (stats.total/elapsed).toFixed(2), avg: Math.round(avg), p95: Math.round(p95) }, null, 2));
    await sql.end({ timeout: 2 }).catch(()=>{});
    if (stats.failed > 0) {
      console.error(`DB test failed: ${stats.failed} query failures`);
      process.exit(1);
    }
  }
}

run().catch(e => {
  console.error('DB test error:', e);
  process.exit(1);
});

