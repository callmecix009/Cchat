import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, settings, whatsappConnections } from '@/lib/db/schema';
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
          .where(eq(settings.userId, userRow.id))
          .limit(1)
      : [];

    const business = found.length ? ((found[0].business ?? null) as { connected?: boolean } | null) : null;
    const logo = found.length ? found[0].logo ?? null : null;
    const avatar = userRow?.avatar ?? null;

    let waRow;
    if (userRow) {
      const wa = await db
        .select()
        .from(whatsappConnections)
        .where(eq(whatsappConnections.userId, userRow.id))
        .limit(1);
      waRow = wa[0];
    }

    const whatsappConnected = !!waRow;
    const whatsappPaused = whatsappConnected && business?.connected === false;
    const u = userRow;
    return NextResponse.json({
      business,
      logo,
      avatar,
      whatsappConnected,
      whatsappPaused,
      whatsappNumber: waRow?.displayPhoneNumber ?? null,
      whatsappBusinessName: waRow?.businessName ?? null,
      planStatus: u?.subscriptionStatus ?? 'inactive',
      plan: u?.subscriptionPlan ?? null,
      trialEndsAt: u?.trialEndsAt ?? null,
      expiresAt: u?.subscriptionExpiresAt ?? null,
    });
  } catch (err: any) {
    console.error('Settings load error:', err);
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

  const business = 'business' in body ? (body?.business ?? null) : undefined;
  const logo = 'logo' in body ? (typeof body?.logo === 'string' && body.logo ? body.logo : null) : undefined;
  const avatar = 'avatar' in body ? (typeof body?.avatar === 'string' && body.avatar ? body.avatar : null) : undefined;

  if (logo && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(logo)) {
    return NextResponse.json({ error: 'INVALID_LOGO', message: 'Logo must be a PNG, JPG or WEBP image.' }, { status: 400 });
  }
  if (logo && logo.length > 800000) {
    return NextResponse.json({ error: 'INVALID_LOGO', message: 'Logo file is too large.' }, { status: 400 });
  }
  if (avatar && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(avatar)) {
    return NextResponse.json({ error: 'INVALID_AVATAR', message: 'Profile photo must be a PNG, JPG or WEBP image.' }, { status: 400 });
  }
  if (avatar && avatar.length > 800000) {
    return NextResponse.json({ error: 'INVALID_AVATAR', message: 'Profile photo is too large.' }, { status: 400 });
  }

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
        .set({
          ...(business !== undefined ? { business } : {}),
          ...(logo !== undefined ? { logo } : {}),
          updatedAt: new Date(),
        })
        .where(eq(settings.userId, userRow.id));
    } else {
      await db.insert(settings).values({
        id: crypto.randomUUID(),
        userId: userRow.id,
        business: business !== undefined ? business : null,
        logo: logo !== undefined ? logo : null,
      });
    }

    if (avatar !== undefined) {
      await db
        .update(users)
        .set({ avatar, updatedAt: new Date() })
        .where(eq(users.id, userRow.id));
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('Settings save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}