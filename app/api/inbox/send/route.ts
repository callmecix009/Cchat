import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, conversations, messages, settings, whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsAppText } from '@/lib/whatsapp';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { conversationId?: string; text?: string; contactName?: string; contactPhone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const conversationId = (body?.conversationId || '').trim();
  const text = (body?.text || '').trim();

  if (!conversationId || !text) {
    return NextResponse.json({ error: 'Missing conversationId or text' }, { status: 400 });
  }
  if (text.length > 4096) {
    return NextResponse.json({ error: 'Message too long' }, { status: 400 });
  }

  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    const convoRow = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    let contactName = body?.contactName || null;
    let contactPhone = body?.contactPhone || null;

    if (convoRow.length) {
      if (convoRow[0].userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      contactName = convoRow[0].contactName || contactName;
      contactPhone = convoRow[0].contactPhone || contactPhone;
    } else {
      await db.insert(conversations).values({
        id: conversationId,
        userId: user.id,
        contactName,
        contactPhone,
        status: 'waiting',
      });
    }

    const statusRow = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, user.id))
      .limit(1);
    const business = (statusRow[0]?.business as { connected?: boolean } | null) ?? null;
    const paused = business?.connected === false;

    if (paused) {
      return NextResponse.json({ error: 'WHATSAPP_PAUSED', message: 'WhatsApp is paused in Settings. Reconnect it before sending replies.' }, { status: 502 });
    }

    const waRow = await db
      .select()
      .from(whatsappConnections)
      .where(eq(whatsappConnections.userId, user.id))
      .limit(1);
    if (!waRow.length) {
      return NextResponse.json({
        error: 'WHATSAPP_NOT_CONNECTED',
        message: 'WhatsApp is not connected yet. Connect it in Settings — until then, replies cannot be delivered to customers.',
      }, { status: 502 });
    }
    if (!contactPhone) {
      return NextResponse.json({ error: 'NO_CONTACT_NUMBER', message: "This conversation has no customer phone number to deliver to." }, { status: 502 });
    }

    await sendWhatsAppText(waRow[0].accessToken, waRow[0].phoneNumberId, contactPhone, text);

    await db.insert(messages).values({
      id: crypto.randomUUID(),
      conversationId,
      role: 'owner',
      content: text,
      aiHandled: false,
    });

    await db
      .update(conversations)
      .set({ status: 'waiting', contactName, contactPhone, createdAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ ok: true, delivered: true }, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (msg.includes('WHATSAPP_SEND_FAILED')) {
      console.error('WhatsApp send failed:', msg.slice(0, 400));
      return NextResponse.json({
        error: 'WHATSAPP_SEND_FAILED',
        message: 'The message could not be delivered to WhatsApp. Check the connection in Settings and try again.',
      }, { status: 502 });
    }
    console.error('Inbox send error:', err);
    return NextResponse.json({ error: 'Send failed' }, { status: 500 });
  }
}