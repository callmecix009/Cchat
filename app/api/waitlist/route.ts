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
