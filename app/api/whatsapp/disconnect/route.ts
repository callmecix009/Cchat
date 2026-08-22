import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    await db
      .delete(whatsappConnections)
      .where(eq(whatsappConnections.userId, user.id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('WhatsApp disconnect error:', err);
    return NextResponse.json({ error: 'Disconnect failed' }, { status: 500 });
  }
}