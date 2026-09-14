import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, products, services, conversations, sales, whatsappConnections } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureDemoSeeded } from '@/lib/seed-demo-persist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Seed massive demo data for mawesemakelele@gmail.com + fake WhatsApp
// Protected by secret: set SEED_SECRET env or use default cchat-seed-2026
// Call: POST /api/seed-mawese with { email: "mawesemakelele@gmail.com", secret: "cchat-seed-2026" }
// Or GET /api/seed-mawese?email=mawesemakelele@gmail.com&secret=cchat-seed-2026

function isAuthorized(req: NextRequest, bodySecret?: string) {
  const expected = process.env.SEED_SECRET || 'cchat-seed-2026';
  const urlSecret = req.nextUrl.searchParams.get('secret');
  const headerSecret = req.headers.get('x-seed-secret');
  const s = bodySecret || urlSecret || headerSecret;
  return s === expected;
}

export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  let bodySecret: string | undefined;
  try {
    const b = await req.json().catch(() => ({}));
    bodySecret = b?.secret;
    // allow email in body
    if (b?.email) req.nextUrl.searchParams.set('email', b.email);
  } catch {}
  return handle(req, bodySecret);
}

async function handle(req: NextRequest, bodySecret?: string) {
  if (!isAuthorized(req, bodySecret)) {
    return NextResponse.json({ error: 'Unauthorized - invalid secret' }, { status: 401 });
  }
  const email = (req.nextUrl.searchParams.get('email') || 'mawesemakelele@gmail.com').trim().toLowerCase();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  try {
    // Find user by email (case-insensitive)
    const found = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let target: typeof users.$inferSelect | undefined = found[0];
    if (!target) {
      // try case-insensitive search via lower
      const all = await db.select().from(users).limit(100);
      target = all.find(u => (u.email || '').toLowerCase() === email);
    }
    if (!target) {
      return NextResponse.json({ error: `User not found for email ${email}. Make sure the user has signed up via Clerk at least once.` }, { status: 404 });
    }

    // Ensure demo owner flag
    if (!target.isDemoOwner) {
      await db.update(users).set({ isDemoOwner: true, updatedAt: new Date() }).where(eq(users.id, target.id));
    }

    // Ensure trial active
    await db.update(users).set({
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 7 * 86400000),
      plan: 'trial',
      onboarded: true,
      updatedAt: new Date(),
    }).where(eq(users.id, target.id));

    // Seed massive demo data
    await ensureDemoSeeded(target.id);

    // Count results
    const prodCount = await db.select().from(products).where(eq(products.userId, target.id));
    const svcCount = await db.select().from(services).where(eq(services.userId, target.id));
    const convCount = await db.select().from(conversations).where(eq(conversations.userId, target.id));
    const salesCount = await db.select().from(sales).where(eq(sales.userId, target.id));
    const wa = await db.select().from(whatsappConnections).where(eq(whatsappConnections.userId, target.id)).limit(1);

    return NextResponse.json({
      ok: true,
      email,
      userId: target.id,
      counts: {
        products: prodCount.length,
        services: svcCount.length,
        conversations: convCount.length,
        sales: salesCount.length,
        whatsappConnected: wa.length > 0,
      },
      message: `Seeded ${prodCount.length} products, ${svcCount.length} services, ${convCount.length} conversations, ${salesCount.length} sales. WhatsApp: ${wa.length ? 'connected (fake)' : 'not connected'}. User is now demo owner with 7-day trial.`,
    });
  } catch (e: any) {
    console.error('Seed mawese error:', e);
    return NextResponse.json({ error: e?.message || 'Seed failed', detail: String(e) }, { status: 500 });
  }
}
