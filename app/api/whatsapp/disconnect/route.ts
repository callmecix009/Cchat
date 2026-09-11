import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';
import { checkRateLimit, getClientIp, rateLimitedResponse } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  {
    const ip = getClientIp(req);
    const rl = checkRateLimit({ key: `wa:disconnect:ip:${ip}`, limit: 10, windowMs: 60_000 });
    if (!rl.success) return rateLimitedResponse(rl);
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  {
    const rl = checkRateLimit({ key: `wa:disconnect:user:${userId}`, limit: 10, windowMs: 60_000 });
    if (!rl.success) return rateLimitedResponse(rl);
  }
  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await db
      .delete(whatsappConnections)
      .where(eq(whatsappConnections.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('WhatsApp disconnect error:', err);
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}