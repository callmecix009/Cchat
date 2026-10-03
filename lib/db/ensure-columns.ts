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

let messageDeliveryEnsured = false;

export async function ensureMessageDeliveryColumns(): Promise<void> {
  if (messageDeliveryEnsured) return;
  try {
    await db.execute(sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered boolean DEFAULT true NOT NULL`);
    await db.execute(sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS test_mode boolean DEFAULT false NOT NULL`);
    messageDeliveryEnsured = true;
  } catch (e) {
    console.error('ensureMessageDeliveryColumns failed:', e);
  }
}

let messageMediaEnsured = false;

export async function ensureMessageMediaColumn(): Promise<void> {
  if (messageMediaEnsured) return;
  try {
    await db.execute(sql`ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_id text`);
    messageMediaEnsured = true;
  } catch (e) {
    console.error('ensureMessageMediaColumn failed:', e);
  }
}

let waitlistEnsured = false;

export async function ensureWaitlistTable(): Promise<void> {
  if (waitlistEnsured) return;
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS waitlist (
      id text PRIMARY KEY,
      user_id text NOT NULL UNIQUE,
      name text NOT NULL,
      phone text NOT NULL,
      business_type text DEFAULT '' NOT NULL,
      note text DEFAULT '' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )`);
    waitlistEnsured = true;
  } catch (e) {
    console.error('ensureWaitlistTable failed:', e);
  }
}
