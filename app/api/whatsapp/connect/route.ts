import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { exchangeAuthCode, isEmbeddedSignupConfigured } from '@/lib/whatsapp';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { authorizationCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const code = (body?.authorizationCode || '').trim();
  if (!code) {
    return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
  }
  if (!isEmbeddedSignupConfigured()) {
    return NextResponse.json(
      { error: 'NOT_CONFIGURED', message: 'WhatsApp connection is not available yet. Try again shortly.' },
      { status: 503 }
    );
  }

  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const info = await exchangeAuthCode(code);

    const existing = await db
      .select({ id: whatsappConnections.id })
      .from(whatsappConnections)
      .where(eq(whatsappConnections.userId, user.id))
      .limit(1);

    if (existing.length) {
      await db
        .update(whatsappConnections)
        .set({
          accessToken: info.accessToken,
          wabaId: info.wabaId,
          phoneNumberId: info.phoneNumberId,
          displayPhoneNumber: info.displayPhoneNumber,
          status: 'connected',
          updatedAt: new Date(),
        })
        .where(eq(whatsappConnections.id, existing[0].id));
    } else {
      await db.insert(whatsappConnections).values({
        id: crypto.randomUUID(),
        userId: user.id,
        accessToken: info.accessToken,
        wabaId: info.wabaId,
        phoneNumberId: info.phoneNumberId,
        displayPhoneNumber: info.displayPhoneNumber,
        status: 'connected',
      });
    }

    return NextResponse.json({
      ok: true,
      displayPhoneNumber: info.displayPhoneNumber,
    });
  } catch (err: any) {
    console.error('WhatsApp connect error:', err);
    const msg = String(err?.message || err || '');
    if (msg.includes('META_NOT_CONFIGURED')) {
      return NextResponse.json(
        { error: 'NOT_CONFIGURED', message: 'WhatsApp connection is not available yet. Try again shortly.' },
        { status: 503 }
      );
    }
    if (msg.includes('NO_WABA') || msg.includes('NO_PHONE_NUMBER')) {
      return NextResponse.json(
        { error: 'NO_PHONE_NUMBER', message: 'We could not find a WhatsApp number on this business account. Add one in Meta Business Suite, then retry.' },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: 'CONNECT_FAILED', message: 'WhatsApp could not complete the connection. Close the popup and try again — if it keeps failing, try again in a few minutes.' },
      { status: 502 }
    );
  }
}