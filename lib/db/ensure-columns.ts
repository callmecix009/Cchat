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

/**
 * Attempts to create the waitlist table and add missing sequence and cascading
 * user foreign-key support to older tables. Skips work after success for this
 * module instance. Database errors are swallowed and setup is retried on the next
 * call; resolving does not guarantee that subsequent waitlist queries will work.
 */
export async function ensureWaitlistTable(): Promise<void> {
  if (waitlistEnsured) return;
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS waitlist (
      id text PRIMARY KEY,
      seq SERIAL NOT NULL,
      user_id text NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      name text NOT NULL,
      phone text NOT NULL,
      business_type text DEFAULT '' NOT NULL,
      note text DEFAULT '' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    )`);
    // Backfill for tables created before the seq/FK constraints existed.
    await db.execute(sql`ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS seq SERIAL NOT NULL`);
    await db.execute(sql`DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'waitlist_user_id_fkey') THEN
        ALTER TABLE waitlist ADD CONSTRAINT waitlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      END IF;
    END $$`);
    waitlistEnsured = true;
  } catch (e) {
    console.error('ensureWaitlistTable failed:', e);
  }
}
