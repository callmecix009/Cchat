import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations, messages } from '@/lib/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';
import { type Convo, type ConvoMsg } from '@/lib/demo';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLE_TO_FROM: Record<string, ConvoMsg['from']> = {
  customer: 'c',
  ai: 'ai',
  owner: 'me',
  sys: 'sys',
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // Fetch conversations with lastReadAt if column exists (handle missing column gracefully)
    let rows: any[] = [];
    try {
      rows = await db
        .select()
        .from(conversations)
        .where(eq(conversations.userId, user.id))
        .orderBy(desc(conversations.createdAt));
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("last_read_at")) {
        // Fallback without lastReadAt if migration not yet applied
        const { conversations: convNoRead } = await import("@/lib/db/schema");
        rows = await db.select().from(convNoRead).where(eq(convNoRead.userId, user.id)).orderBy(desc(convNoRead.createdAt));
        rows = rows.map((r: any) => ({ ...r, lastReadAt: null }));
      } else throw e;
    }

    const msgsByConvo = new Map<string, ConvoMsg[]>();
    if (rows.length) {
      const ids = rows.map((r) => r.id);
      const msgs = await db
        .select()
        .from(messages)
        .where(inArray(messages.conversationId, ids))
        .orderBy(desc(messages.createdAt));
      for (const m of msgs) {
        const list = msgsByConvo.get(m.conversationId) ?? [];
        list.push({
          from: ROLE_TO_FROM[m.role] ?? 'sys',
          text: m.content,
          t: m.createdAt?.getTime() ?? Date.now(),
        });
        msgsByConvo.set(m.conversationId, list);
      }
      for (const list of msgsByConvo.values()) list.reverse();
    }

    const dbConvos: any[] = rows.map((r) => {
      const msgs = msgsByConvo.get(r.id) ?? [];
      const lastReadAt = (r as any).lastReadAt ? new Date((r as any).lastReadAt).getTime() : 0;
      // Unread = customer messages after lastReadAt
      // If never read (null/0), consider only messages in last 7 days as unread for demo initial state? For now, if lastReadAt is 0, treat as 0 unread for old demo data to avoid flooding
      let unreadCount = 0;
      if ((r as any).lastReadAt) {
        unreadCount = msgs.filter((m) => m.from === "c" && m.t > lastReadAt).length;
      } else {
        // For existing rows without lastReadAt, check if last message is recent customer message (< 2h) -> count as unread
        // Otherwise 0 to avoid showing all old demo as unread
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
        lastReadAt: (r as any).lastReadAt ?? null,
      };
    });

    const finalList = dbConvos.sort((a, b) => b.t - a.t);

    return NextResponse.json({ conversations: finalList });
  } catch (err) {
    console.error('Inbox load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}