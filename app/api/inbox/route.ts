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
      .orderBy(desc(conversations.createdAt));

    // Try to fetch lastReadAt separately if column exists (gracefully handle missing column)
    let lastReadMap = new Map<string, number>();
    try {
      const withRead: any[] = await db.select({ id: conversations.id, lastReadAt: (conversations as any).lastReadAt }).from(conversations).where(eq(conversations.userId, user.id));
      for (const r of withRead) if (r.lastReadAt) lastReadMap.set(r.id, new Date(r.lastReadAt).getTime());
    } catch {}

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