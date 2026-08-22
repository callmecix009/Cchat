import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, settings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

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

  const answers = body?.answers ?? {};
  const dynLists = body?.dynLists ?? {};

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress ?? '';
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber ?? null;

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    const userIdField = existing.length ? existing[0].id : crypto.randomUUID();

    if (existing.length) {
      await db
        .update(users)
        .set({
          email,
          name,
          phone,
          onboarded: true,
          onboardingData: { answers, dynLists },
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    } else {
      await db.insert(users).values({
        id: userIdField,
        clerkId: userId,
        email,
        name,
        phone,
        onboarded: true,
        onboardingData: { answers, dynLists },
      });
    }

    const business = {
      name: typeof answers[1] === 'string' && answers[1].trim() ? answers[1].trim() : name || null,
      desc: typeof answers[2] === 'string' ? answers[2].trim() : '',
      city: typeof answers[3] === 'string' ? answers[3].trim() : '',
      owner: typeof answers[8] === 'string' ? answers[8].trim() : name?.split(' ')[0] || null,
      phone: typeof answers[43] === 'string' ? answers[43].trim() : phone || null,
    };

    const settingsRow = await db
      .select()
      .from(settings)
      .where(eq(settings.userId, userIdField))
      .limit(1);

    if (settingsRow.length) {
      const prev = (settingsRow[0].business as { connected?: boolean } | null) ?? {};
      await db
        .update(settings)
        .set({
          business: { ...prev, ...business },
          updatedAt: new Date(),
        })
        .where(eq(settings.userId, userIdField));
    } else {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        userId: userIdField,
        business,
      });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('Onboarding save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}