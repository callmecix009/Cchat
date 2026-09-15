import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { type Convo, type ConvoMsg } from '@/lib/demo';
import { ensureUserRow } from '@/lib/ensureUser';
import { checkRateLimit, getClientIp, rateLimitedResponse, RL_INBOX } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLE_TO_FROM: Record<string, ConvoMsg['from']> = {
  customer: 'c',
  ai: 'ai',
  owner: 'me',
  sys: 'sys',
};

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rlIp = checkRateLimit({ key: `inbox:get:ip:${ip}`, limit: RL_INBOX.limit, windowMs: RL_INBOX.windowMs });
  if (!rlIp.success) return rateLimitedResponse(rlIp);

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rlUser = checkRateLimit({ key: `inbox:get:user:${userId}`, limit: RL_INBOX.limit, windowMs: RL_INBOX.windowMs });
  if (!rlUser.success) return rateLimitedResponse(rlUser);

  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    // Ensure demo data is persisted as real rows for demo owners
    if (user.isDemoOwner) {
      try {
        const { ensureDemoSeeded } = await import("@/lib/seed-demo-persist");
        await ensureDemoSeeded(user.id);
      } catch (e) {
        console.error("Demo seeding from inbox failed:", e);
      }
    }

    // Fetch conversations (explicit columns to avoid missing last_read_at column before migration)
    const rows: any[] = await db
      .select({
        id: conversations.id,
        userId: conversations.userId,
        contactName: conversations.contactName,
        contactPhone: conversations.contactPhone,
        status: conversations.status,
        outcome: conversations.outcome,
        soldProduct: conversations.soldProduct,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(eq(conversations.userId, user.id))
      .orderBy(desc(conversations.createdAt))
      .limit(60);

    // Try to fetch lastReadAt separately if column exists (gracefully handle missing column)
    let lastReadMap = new Map<string, number>();
    try {
      const withRead: any[] = await db.select({ id: conversations.id, lastReadAt: (conversations as any).lastReadAt }).from(conversations).where(eq(conversations.userId, user.id));
      for (const r of withRead) if (r.lastReadAt) lastReadMap.set(r.id, new Date(r.lastReadAt).getTime());
    } catch {}

    const msgsByConvo = new Map<string, ConvoMsg[]>();
    if (rows.length) {
      const ids = rows.map((r) => r.id);
      // Per-conversation bounded transcript: the old global ORDER BY +
      // LIMIT(2000) let busy threads starve quiet ones (empty transcript +
      // wrong unreadCount). Window function keeps the newest N per thread.
      const msgs = await db.execute<{
        id: string;
        conversation_id: string;
        role: string;
        content: string;
        ai_handled: boolean | null;
        created_at: Date;
      }>(sql`SELECT id, conversation_id, role, content, ai_handled, created_at FROM (
        SELECT m.*, ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) AS rn
        FROM messages m WHERE m.conversation_id = ANY(${ids})
      ) t WHERE rn <= 120 ORDER BY created_at DESC`);
      for (const m of msgs) {
        const list = msgsByConvo.get(m.conversation_id) ?? [];
        const at = m.created_at ? new Date(m.created_at) : new Date();
        list.push({
          from: ROLE_TO_FROM[m.role] ?? 'sys',
          text: m.content,
          t: at.getTime(),
        });
        msgsByConvo.set(m.conversation_id, list);
      }
      for (const list of msgsByConvo.values()) list.reverse();
    }

    const dbConvos: any[] = rows.map((r) => {
      const msgs = msgsByConvo.get(r.id) ?? [];
      const lastReadAt = lastReadMap.get(r.id) ?? 0;
      let unreadCount = 0;
      if (lastReadMap.has(r.id)) {
        unreadCount = msgs.filter((m) => m.from === "c" && m.t > lastReadAt).length;
      } else {
        const last = msgs[msgs.length - 1];
        if (last && last.from === "c" && Date.now() - last.t < 2 * 3600000) {
          unreadCount = 1;
        }
      }
      return {
        id: r.id,
        name: r.contactName || 'Customer',
        phone: r.contactPhone || '',
        lang: 'sw',
        status: (['ai', 'waiting', 'closed'] as const).includes(r.status as Convo['status'])
          ? (r.status as Convo['status'])
          : 'ai',
        t: r.createdAt?.getTime() ?? Date.now(),
        msgs,
        reason: null,
        takeover: false,
        greeted: true,
        outcome: r.outcome === "sold" || r.outcome === "no" ? r.outcome : null,
        soldProduct: r.soldProduct ?? null,
        unreadCount,
        lastReadAt: lastReadMap.get(r.id) ? new Date(lastReadMap.get(r.id)!).toISOString() : null,
      };
    });

    const finalList = dbConvos.sort((a, b) => b.t - a.t);

    return NextResponse.json({ conversations: finalList });
  } catch (err) {
    console.error('Inbox load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}