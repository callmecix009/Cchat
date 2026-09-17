#!/usr/bin/env node
// Direct DB concurrency test — measures postgres pool + indexes without HTTP/Clerk.
// Usage: node load-tests/db-test.js --vus 10 --iter 20
const args = process.argv.slice(2);
const getArg = (k,d) => { const i=args.indexOf(`--${k}`); return i>=0&&args[i+1]?args[i+1]:d; };
const VUS = parseInt(getArg('vus','10'),10);
const ITERS = parseInt(getArg('iter','20'),10);

async function run() {
  const { getDb } = await import('../lib/db/index.ts').catch(async()=> {
    // fallback: use postgres directly via env
    const postgres = (await import('postgres')).default;
    const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
    if(!url){ console.error('No DATABASE_URL'); process.exit(1); }
    const sql = postgres(url, { prepare:false, max: 10 });
    return { getDb: ()=> ({ execute: sql, unsafe: sql }) };
  });
}

