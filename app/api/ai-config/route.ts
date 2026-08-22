import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userRow = await ensureUserRow(userId);
    const found = userRow
      ? await db
          .select()
          .from(settings)
          .innerJoin(users, eq(settings.userId, users.id))
          .where(eq(users.clerkId, userId))
          .limit(1)
      : [];

    if (found.length && found[0].settings.aiConfig) {
      return NextResponse.json({ ai: found[0].settings.aiConfig });
    }
    return NextResponse.json({ ai: null });
  } catch (err: any) {
    console.error('AI config load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const aiConfig = body?.ai ?? null;

  try {
    const userRow = await ensureUserRow(userId);

    if (!userRow) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userRow.id))
      .limit(1);

    if (existing.length) {
      await db
        .update(settings)
        .set({ aiConfig, updatedAt: new Date() })
        .where(eq(settings.userId, userRow.id));
    } else {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        userId: userRow.id,
        aiConfig,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('AI config save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}