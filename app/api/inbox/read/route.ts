import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { conversationId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid body' }, { status: 400 }); }

  const conversationId = (body?.conversationId || '').trim();
  if (!conversationId) return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });

  try {
    const user = await ensureUserRow(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Verify ownership
    const convo = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
    if (!convo.length) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    if (convo[0].userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Update lastReadAt to now (handle missing column gracefully)
    try {
      await db.update(conversations).set({ lastReadAt: new Date() } as any).where(eq(conversations.id, conversationId));
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("last_read_at")) {
        // Column not yet migrated - ignore, frontend will treat as read via local state
        return NextResponse.json({ ok: true, fallback: true });
      }
      throw e;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Mark read error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
