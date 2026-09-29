import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, conversations, messages, settings, whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsAppImage } from '@/lib/whatsapp';
import { ensureUserRow } from '@/lib/ensureUser';
import { ensureMessageDeliveryColumns, ensureMessageMediaColumn } from '@/lib/db/ensure-columns';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_INBOX_SEND, RL_INBOX_SEND_USER } from '@/lib/rate-limit';

export const runtime = 'nodejs';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (serverless payload safe)
const MAX_CAPTION = 1024; // WhatsApp image caption limit

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  {
    const ip = getClientIp(req);
    const rlIp = checkRateLimit({ key: `inbox:image:ip:${ip}`, limit: 60, windowMs: 60_000 });
    if (!rlIp.success) return rateLimitedResponse(rlIp);
    const rlUser = checkRateLimit({ key: `inbox:image:user:${userId}`, limit: RL_INBOX_SEND_USER.limit, windowMs: RL_INBOX_SEND_USER.windowMs });
    if (!rlUser.success) return rateLimitedResponse(rlUser);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const conversationId = String(form.get('conversationId') || '').trim();
  const caption = String(form.get('caption') || '').trim();
  const contactName = String(form.get('contactName') || '').trim() || null;
  const contactPhone = String(form.get('contactPhone') || '').trim() || null;
  const file = form.get('file');

  if (!conversationId || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing conversationId or file' }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'INVALID_TYPE', message: 'Only JPG, PNG or WebP images are supported.' }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'INVALID_SIZE', message: 'Image must be smaller than 4 MB.' }, { status: 400 });
  }
  if (caption.length > MAX_CAPTION) {
    return NextResponse.json({ error: 'CAPTION_TOO_LONG', message: 'Caption must be 1024 characters or less.' }, { status: 400 });
  }

  {
    const rlConv = checkRateLimit({ key: `inbox:send:conv:${userId}:${conversationId}`, limit: RL_INBOX_SEND.limit, windowMs: RL_INBOX_SEND.windowMs });
    if (!rlConv.success) return rateLimitedResponse(rlConv);
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

    let name = contactName;
    let phone = contactPhone;

    if (convoRow.length) {
      if (convoRow[0].userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      name = convoRow[0].contactName || name;
      phone = convoRow[0].contactPhone || phone;
    } else {
      await db.insert(conversations).values({
        id: conversationId,
        userId: user.id,
        contactName: name,
        contactPhone: phone,
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
    if (!phone) {
      return NextResponse.json({ error: 'NO_CONTACT_NUMBER', message: "This conversation has no customer phone number to deliver to." }, { status: 502 });
    }

    const isTestConnection = waRow[0].accessToken.startsWith('demo_fake_token_');
    await ensureMessageDeliveryColumns();
    await ensureMessageMediaColumn();
    let mediaId: string | null = null;
    if (!isTestConnection) {
      const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      ({ mediaId } = await sendWhatsAppImage(waRow[0].accessToken, waRow[0].phoneNumberId, phone, {
        bytes: file,
        mimeType: file.type,
        filename: `cchat-${Date.now()}.${ext}`,
      }, caption || undefined));
    } else {
      console.log(`Inbox image TEST MODE for user ${user.id.slice(0, 8)} — persisted locally, not delivered to WhatsApp.`);
    }

    // Same convention as the webhook's non-text placeholder: text marker + caption.
    const content = caption ? `[image] ${caption}` : '[image]';
    const messageId = crypto.randomUUID();
    await db.insert(messages).values({
      id: messageId,
      conversationId,
      role: 'owner',
      content,
      aiHandled: false,
      delivered: !isTestConnection,
      testMode: isTestConnection,
      mediaId,
    });

    await db
      .update(conversations)
      .set({ status: 'waiting', contactName: name, contactPhone: phone, createdAt: new Date() })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ ok: true, delivered: !isTestConnection, testMode: isTestConnection, messageId, mediaId }, { status: 200 });
  } catch (err: any) {
    const msg = String(err?.message || err || '');
    if (msg.includes('WHATSAPP_SEND_FAILED')) {
      console.error('WhatsApp image send failed:', msg.slice(0, 400));
      return NextResponse.json({
        error: 'WHATSAPP_SEND_FAILED',
        message: 'The image could not be delivered to WhatsApp. Check the connection in Settings and try again.',
      }, { status: 502 });
    }
    console.error('Inbox image error:', err);
    return NextResponse.json({ error: 'Send failed' }, { status: 500 });
  }
}
