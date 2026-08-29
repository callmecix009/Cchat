import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!row.length) {
      return NextResponse.json({ status: 'inactive', plan: null });
    }
    const u = row[0];
    // Demo owner bypasses billing checks - always active for testing
    if (u.isDemoOwner) {
      return NextResponse.json({
        status: "active",
        plan: "trial",
        trialEndsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
        subscriptionExpiresAt: null,
        lastPaymentAt: null,
        isDemo: true,
      });
    }
    const now = Date.now();
    const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : 0;
    const subEnds = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : 0;

    let effectiveStatus = u.subscriptionStatus || 'inactive';

    // Check if trial has expired
    if (effectiveStatus === 'trialing' && trialEnds > 0 && trialEnds <= now) {
      effectiveStatus = 'expired';
    }

    // Check if subscription has expired
    if (effectiveStatus === 'active' && subEnds > 0 && subEnds <= now) {
      effectiveStatus = 'expired';
    }

    return NextResponse.json({
      status: effectiveStatus,
      plan: u.subscriptionPlan || null,
      trialEndsAt: u.trialEndsAt || null,
      subscriptionExpiresAt: u.subscriptionExpiresAt || null,
      lastPaymentAt: u.lastPaymentAt || null,
    });
  } catch (err) {
    console.error('Billing load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { plan?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { plan, action } = body || {};

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (!row.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = row[0];
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (action === 'start_trial') {
      // Start a 3-day trial
      if (u.subscriptionStatus === 'trialing' && u.trialEndsAt && new Date(u.trialEndsAt).getTime() > Date.now()) {
        return NextResponse.json({ error: 'Trial already active' }, { status: 400 });
      }
      updates.subscriptionStatus = 'trialing';
      updates.trialEndsAt = new Date(Date.now() + 3 * 86400000);
      updates.plan = 'trial';
    } else if (action === 'subscribe' && plan) {
      // Activate subscription (called after successful payment)
      const duration = plan === 'yearly' ? 365 : 30;
      updates.subscriptionStatus = 'active';
      updates.subscriptionPlan = plan;
      updates.subscriptionExpiresAt = new Date(Date.now() + duration * 86400000);
      updates.lastPaymentAt = new Date();
      updates.plan = plan;
    } else if (action === 'cancel') {
      updates.subscriptionStatus = 'canceled';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await db.update(users).set(updates).where(eq(users.clerkId, userId));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Billing update error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
