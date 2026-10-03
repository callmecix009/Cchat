import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { waitlist } from '@/lib/db/schema';
import { eq, lte, sql } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';
import { ensureWaitlistTable } from '@/lib/db/ensure-columns';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_ONBOARDING } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BUSINESS_TYPES = ['Duka / Shop', 'Pharmacy', 'Salon / Barber', 'Food / Restaurant', 'Electronics', 'Fashion', 'Services', 'Other'];

/**
 * Reads waitlist status, ensuring the local user and attempting table setup first.
 * May create the user or update demo-owner access through ensureUserRow.
 *
 * @param userId - Clerk user ID, not the local database user ID.
 * @returns JSON with joined, total, and position (null before joining), plus the
 * stored name for members; 404 if no local user can be resolved. Position counts
 * existing entries with a sequence at or below the member's, so it can change.
 * @throws Propagates user-resolution and waitlist-query errors to the caller.
 */
async function statusFor(userId: string) {
  const user = await ensureUserRow(userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  await ensureWaitlistTable();
  const rows = await db.select().from(waitlist).where(eq(waitlist.userId, user.id)).limit(1);
  if (!rows.length) {
    const total = await db.select({ n: sql<number>`COUNT(*)::int` }).from(waitlist);
    return NextResponse.json({ joined: false, position: null, total: Number(total[0]?.n ?? 0) });
  }
  const mine = rows[0];
  const ahead = await db.select({ n: sql<number>`COUNT(*)::int` }).from(waitlist).where(lte(waitlist.seq, mine.seq));
  const total = await db.select({ n: sql<number>`COUNT(*)::int` }).from(waitlist);
  return NextResponse.json({
    joined: true,
    position: Number(ahead[0]?.n ?? 1),
    total: Number(total[0]?.n ?? 1),
    name: mine.name,
  });
}

/**
 * Returns the signed-in user's status via statusFor, including its setup effects.
 * Returns 429 when the trusted-IP limit is exceeded (skipped without a trusted
 * IP), 401 without a session, 404 without a local user, or 500 if statusFor fails.
 *
 * @throws Propagates authentication errors occurring before status lookup.
 */
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit({ key: `waitlist:get:ip:${ip}`, limit: RL_ONBOARDING.limit, windowMs: RL_ONBOARDING.windowMs });
  if (!rl.success) return rateLimitedResponse(rl);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    return await statusFor(userId);
  } catch (err) {
    console.error('Waitlist status error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

/**
 * Joins the signed-in user once and returns statusFor's current queue status.
 * Existing entries keep their original details. May create or update the local
 * user and attempts table setup before inserting.
 *
 * Expects JSON name, phone, businessType, and optional note strings. Trims name
 * and note, then truncates them to 120 and 500 UTF-16 code units, respectively.
 * Phone normalization removes nondigits and replaces a leading zero with 255;
 * at least nine resulting digits, a nonempty name, and a trimmed businessType
 * from BUSINESS_TYPES are required.
 * Returns 400 for unreadable JSON or failed validation, 401 without a session,
 * 404 without a local user, 429 when the trusted-IP limit is exceeded (skipped
 * without a trusted IP), or 500 for failures during persistence or status lookup.
 *
 * @throws Propagates authentication errors and TypeError from truthy non-string
 * fields during normalization, which occurs outside the persistence error handler.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit({ key: `waitlist:post:ip:${ip}`, limit: RL_ONBOARDING.limit, windowMs: RL_ONBOARDING.windowMs });
  if (!rl.success) return rateLimitedResponse(rl);

  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { name?: string; phone?: string; businessType?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const name = (body?.name || '').trim().slice(0, 120);
  const phone = normalizeWhatsAppNumber(body?.phone || '');
  const businessType = (body?.businessType || '').trim();
  const note = (body?.note || '').trim().slice(0, 500);

  if (!name) {
    return NextResponse.json({ error: 'INVALID_NAME', message: 'Please tell us your name.' }, { status: 400 });
  }
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'INVALID_PHONE', message: 'Please enter a valid WhatsApp number.' }, { status: 400 });
  }
  if (!BUSINESS_TYPES.includes(businessType)) {
    return NextResponse.json({ error: 'INVALID_TYPE', message: 'Please choose your business type.' }, { status: 400 });
  }

  try {
    const user = await ensureUserRow(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await ensureWaitlistTable();

    // Conflict-safe: concurrent joins for the same user collapse onto the
    // unique user_id instead of throwing. Either way, return live status.
    await db
      .insert(waitlist)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        name,
        phone,
        businessType,
        note,
      })
      .onConflictDoNothing({ target: waitlist.userId });
    return await statusFor(userId);
  } catch (err) {
    console.error('Waitlist join error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
