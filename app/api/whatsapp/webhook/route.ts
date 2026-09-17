import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { conversations, messages, whatsappConnections } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { normalizeWhatsAppNumber, verifyMetaSignature, webhookVerifyToken } from '@/lib/whatsapp';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_WEBHOOK } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function now() {
  return new Date();
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit({ key: `wa:webhook:get:ip:${ip}`, limit: RL_WEBHOOK.limit, windowMs: RL_WEBHOOK.windowMs });
  if (!rl.success) return rateLimitedResponse(rl);

  const mode = req.nextUrl.searchParams.get('hub.mode');
  const token = req.nextUrl.searchParams.get('hub.verify_token');
  const challenge = req.nextUrl.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === webhookVerifyToken() && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Verification failed', { status: 403 });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit({ key: `wa:webhook:post:ip:${ip}`, limit: RL_WEBHOOK.limit, windowMs: RL_WEBHOOK.windowMs });
  if (!rl.success) return rateLimitedResponse(rl);

  const raw = await req.text().catch(() => '');
  if (!verifyMetaSignature(raw, req.headers.get('x-hub-signature-256'))) {
    return new NextResponse('Invalid signature', { status: 403 });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw || '{}');
  } catch {
    return new NextResponse('Bad payload', { status: 400 });
  }

  try {
    const entries: any[] = payload?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const phoneNumberId = String(value?.metadata?.phone_number_id || '');
        const waMsgs: any[] = value?.messages ?? [];

        if (!phoneNumberId || !waMsgs.length) continue;

        const conn = await db
          .select()
          .from(whatsappConnections)
          .where(eq(whatsappConnections.phoneNumberId, phoneNumberId))
          .limit(1);
        if (!conn.length) continue;

        for (const wa of waMsgs) {
          const from = String(wa.from || '');
          const text = wa.type === 'text' ? wa.text?.body : `[${wa.type}]`;
          if (!from || !text) continue;
          const ts = Number(wa.timestamp || 0) * 1000;

          const normalized = normalizeWhatsAppNumber(from);
          const convoId = `${conn[0].userId}_wa_${normalized}`;
          let existing = await db
            .select()
            .from(conversations)
            .where(and(eq(conversations.id, convoId), eq(conversations.userId, conn[0].userId)))
            .limit(1);

          const contactName = value.contacts?.[0]?.profile?.name ?? null;

          if (!existing.length) {
            const legacyId = `wa_${normalized}`;
            const legacyExisting = await db
              .select()
              .from(conversations)
              .where(and(eq(conversations.id, legacyId), eq(conversations.userId, conn[0].userId)))
              .limit(1);
            if (legacyExisting.length) {
              try {
                await db
                  .insert(conversations)
                  .values({
                    id: convoId,
                    userId: conn[0].userId,
                    contactName: legacyExisting[0].contactName || contactName,
                    contactPhone: legacyExisting[0].contactPhone || from,
                    status: 'ai',
                  })
                  .onConflictDoNothing();
              } catch {}
              await db
                .update(messages)
                .set({ conversationId: convoId } as any)
                .where(eq(messages.conversationId, legacyId));
              await db
                .delete(conversations)
                .where(and(eq(conversations.id, legacyId), eq(conversations.userId, conn[0].userId)));
              existing = await db
                .select()
                .from(conversations)
                .where(and(eq(conversations.id, convoId), eq(conversations.userId, conn[0].userId)))
                .limit(1);
            }
          }

          if (existing.length) {
            await db
              .update(conversations)
              .set({
                status: 'ai',
                contactName: existing[0].contactName || contactName,
                createdAt: new Date(),
              })
              .where(and(eq(conversations.id, convoId), eq(conversations.userId, conn[0].userId)));
          } else {
            await db.insert(conversations).values({
              id: convoId,
              userId: conn[0].userId,
              contactName,
              contactPhone: from,
              status: 'ai',
            });
          }

          await db.insert(messages).values({
            id: crypto.randomUUID(),
            conversationId: convoId,
            role: 'customer',
            content: text,
            aiHandled: false,
            createdAt: ts ? new Date(ts) : now(),
          });
        }
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    return new NextResponse('Error', { status: 500 });
  }
}