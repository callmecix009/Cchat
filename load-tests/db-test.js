#!/usr/bin/env node
// Direct DB concurrency test — measures postgres pool + indexes without HTTP/Clerk.
// Usage: node load-tests/db-test.js --vus 10 --iter 20
const args = process.argv.slice(2);
const getArg = (k,d) => { const i=args.indexOf(`--${k}`); return i>=0&&args[i+1]?args[i+1]:d; };
const VUS = parseInt(getArg('vus','10'),10);
const ITERS = parseInt(getArg('iter','20'),10);

// Validate VUS and ITERS are positive integers
if (!Number.isInteger(VUS) || VUS <= 0) {
  console.error('--vus must be a positive integer');
  process.exit(1);
}
if (!Number.isInteger(ITERS) || ITERS <= 0) {
  console.error('--iter must be a positive integer');
  process.exit(1);
}

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
  // Track both statements and iterations separately
  const stats = { 
    iterations: 0, 
    statements: 0, 
    failedStatements: 0, 
    failedIterations: 0, 
    durs: [] 
  };
  const startAll = performance.now();
  const iterationsPerWorker = ITERS;
  // 2 statements per iteration (product count + conversation lookup)
  const totalStatementsExpected = VUS * ITERS * 2;
  console.log(`DB concurrency test — ${VUS} VU × ${ITERS} iters (${totalStatementsExpected} statements, ${VUS * ITERS} iterations)`);
  async function worker(id) {
    for (let i = 0; i < ITERS; i++) {
      const iterStart = performance.now();
      let iterOk = true;
      // Statement 1: per-tenant product count (uses products_user_id_idx)
      const s1 = performance.now();
      try {
        await sql`SELECT COUNT(*)::int as c FROM products WHERE user_id = ${id % VUS + 1}`;
        stats.statements++;
        stats.durs.push(performance.now() - s1);
      } catch (e) {
        stats.failedStatements++;
        stats.durs.push(performance.now() - s1);
        iterOk = false;
      }
      // Statement 2: indexed conversation lookup (uses conversations_user_id_idx + messages_conversation_id_idx)
      const s2 = performance.now();
      try {
        await sql`SELECT COUNT(*)::int as c FROM conversations WHERE user_id = ${id % VUS + 1}`;
        stats.statements++;
        stats.durs.push(performance.now() - s2);
      } catch (e) {
        stats.failedStatements++;
        stats.durs.push(performance.now() - s2);
        iterOk = false;
      }
      if (!iterOk) stats.failedIterations++;
      stats.iterations++;
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
    console.log(JSON.stringify({ 
      vus: VUS, 
      iters: ITERS, 
      iterations: stats.iterations,
      statements: stats.statements,
      failedIterations: stats.failedIterations,
      failedStatements: stats.failedStatements,
      rps: (stats.statements/elapsed).toFixed(2), 
      iterRps: (stats.iterations/elapsed).toFixed(2),
      avg: Math.round(avg), 
      p95: Math.round(p95) 
    }, null, 2));
    await sql.end({ timeout: 2 }).catch(()=>{});
    if (stats.failedStatements > 0 || stats.failedIterations > 0) {
      console.error(`DB test completed with failures: ${stats.failedStatements} statement failures, ${stats.failedIterations} iteration failures`);
      process.exit(1);
    }
  }
}

run().catch(e => {
  console.error('DB test error:', e);
  process.exit(1);
});

