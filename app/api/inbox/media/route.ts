import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';
import { ensureMessageMediaColumn } from '@/lib/db/ensure-columns';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_INBOX } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GRAPH = 'https://graph.facebook.com/v21.0';

// Streams a WhatsApp image (by Meta media id) to the owner after verifying
// the media belongs to one of their conversations. Nothing is stored locally.
export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rlIp = checkRateLimit({ key: `inbox:media:ip:${ip}`, limit: RL_INBOX.limit, windowMs: RL_INBOX.windowMs });
  if (!rlIp.success) return rateLimitedResponse(rlIp);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const mediaId = (req.nextUrl.searchParams.get('id') || '').trim();
  if (!mediaId || mediaId.length > 128) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await ensureMessageMediaColumn();
    const rows = await db
      .select({ conversationId: messages.conversationId })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(and(eq(messages.mediaId, mediaId), eq(conversations.userId, user.id)))
      .limit(1);
    if (!rows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { whatsappConnections } = await import('@/lib/db/schema');
    const waRow = await db
      .select()
      .from(whatsappConnections)
      .where(eq(whatsappConnections.userId, user.id))
      .limit(1);
    if (!waRow.length) {
      return NextResponse.json({ error: 'Not connected' }, { status: 502 });
    }

    // Resolve the temporary CDN URL, then stream the bytes through.
    const metaRes = await fetch(`${GRAPH}/${encodeURIComponent(mediaId)}`, {
      headers: { Authorization: `Bearer ${waRow[0].accessToken}` },
    });
    if (!metaRes.ok) {
      return NextResponse.json({ error: 'Media unavailable' }, { status: 502 });
    }
    const metaJson = await metaRes.json().catch(() => ({}));
    const url: string | undefined = metaJson.url;
    const mime: string = typeof metaJson.mime_type === 'string' ? metaJson.mime_type : 'image/jpeg';
    if (!url) {
      return NextResponse.json({ error: 'Media unavailable' }, { status: 502 });
    }

    const fileRes = await fetch(url, { headers: { Authorization: `Bearer ${waRow[0].accessToken}` } });
    if (!fileRes.ok || !fileRes.body) {
      return NextResponse.json({ error: 'Media unavailable' }, { status: 502 });
    }
    const buf = await fileRes.arrayBuffer();
    if (!buf.byteLength || buf.byteLength > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Media unavailable' }, { status: 502 });
    }
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': mime.startsWith('image/') ? mime : 'image/jpeg',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Inbox media error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
