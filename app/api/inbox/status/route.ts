import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { conversationId?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const conversationId = (body?.conversationId || '').trim();
  const newStatus = (body?.status || '').trim();

  if (!conversationId || !newStatus) {
    return NextResponse.json({ error: 'Missing conversationId or status' }, { status: 400 });
  }

  if (!['ai', 'waiting', 'closed'].includes(newStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const convo = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!convo.length) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Verify ownership
    const { users } = await import('@/lib/db/schema');
    const { eq: eqOp } = await import('drizzle-orm');
    const user = await db.select().from(users).where(eqOp(users.clerkId, userId)).limit(1);
    if (!user.length || convo[0].userId !== user[0].id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db
      .update(conversations)
      .set({ status: newStatus })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (err) {
    console.error('Conversation status update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
