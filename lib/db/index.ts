import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getClient() {
  if (!_client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      // Actionable error for Vercel logs — this is the #2 cause of "This page couldn't load"
      // after sign-in (dashboard/layout and /api/* all need DB). Supabase pooler URL must be
      // set in Vercel Env (Production) with %23 for # in password, port 6543 for DATABASE_URL.
      throw new Error(
        "DATABASE_URL is not set. Add Supabase Transaction Pooler (port 6543, ?pgbouncer=true) as DATABASE_URL in Vercel Environment Variables and redeploy."
      );
    }
    _client = postgres(url, { prepare: false });
  }
  return _client;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getClient(), { schema });
  }
  return _db;
}

// Lazy proxy: `db.select(...)` works without crashing at module load time
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
