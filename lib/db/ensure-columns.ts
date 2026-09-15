import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Self-healing schema guard: ensures columns added after the last
// applied migration exist before queries that reference them run.
// (Local/prod DBs may not have had `drizzle-kit push` run yet.)
let productImageEnsured = false;

export async function ensureProductImageColumn(): Promise<void> {
  if (productImageEnsured) return;
  try {
    await db.execute(sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS image text`);
    productImageEnsured = true;
  } catch (e) {
    console.error('ensureProductImageColumn failed:', e);
  }
}
