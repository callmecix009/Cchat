import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getWorkspaceForClerkUser } from '@/lib/workspace';
import { db } from '@/lib/db';
import { products as productsTable, services as servicesTable, policies as policiesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type IncomingProduct = {
  id?: string;
  name?: string;
  cat?: string;
  price?: number | string;
  stock?: number | string;
  emoji?: string;
  cl?: string;
  kw?: string[];
  sold?: number;
  hidden?: boolean;
};

type IncomingService = {
  id?: string;
  name?: string;
  desc?: string;
  price?: number | string;
  from?: boolean;
  dur?: string;
  booking?: boolean;
  warranty?: string;
};

const num = (v: unknown, fallback = 0) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : fallback;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const workspace = await getWorkspaceForClerkUser(userId);
    return NextResponse.json(workspace);
  } catch (err) {
    console.error('Workspace load error:', err);
    return NextResponse.json({ error: 'Load failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: {
    products?: IncomingProduct[];
    services?: IncomingService[];
    lowStockThreshold?: number;
    policies?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  try {
    const userRow = await ensureUserRow(userId);
    if (!userRow) {
      return NextResponse.json({ error: 'User not found in DB' }, { status: 404 });
    }

    // Replace-all strategy for products
    if (Array.isArray(body.products)) {
      const list = body.products.filter((p) => typeof p?.name === 'string' && p.name.trim());
      await db.delete(productsTable).where(eq(productsTable.userId, userRow.id));
      if (list.length) {
        await db.insert(productsTable).values(
          list.map((p, i) => ({
            id: (typeof p.id === 'string' && p.id) || crypto.randomUUID(),
            userId: userRow.id,
            name: p.name!.trim().slice(0, 200),
            cat: (p.cat ?? '').toString().slice(0, 80),
            price: num(p.price),
            stock: Math.max(0, num(p.stock)),
            emoji: (p.emoji ?? '📦').toString().slice(0, 16),
            color: (p.cl ?? '#E3F4E9').toString().slice(0, 32),
            keywords: Array.isArray(p.kw) ? p.kw.map(String).slice(0, 20) : [],
            sold: Math.max(0, num(p.sold)),
            hidden: !!p.hidden,
            sortOrder: i,
          }))
        );
      }
    }

    // Replace-all strategy for services
    if (Array.isArray(body.services)) {
      const list = body.services.filter((s) => typeof s?.name === 'string' && s.name.trim());
      await db.delete(servicesTable).where(eq(servicesTable.userId, userRow.id));
      if (list.length) {
        await db.insert(servicesTable).values(
          list.map((s) => ({
            id: (typeof s.id === 'string' && s.id) || crypto.randomUUID(),
            userId: userRow.id,
            name: s.name!.trim().slice(0, 200),
            desc: (s.desc ?? '').toString().slice(0, 600),
            price: num(s.price),
            priceFrom: !!s.from,
            duration: (s.dur ?? '').toString().slice(0, 60),
            booking: !!s.booking,
            warranty: (s.warranty ?? '').toString().slice(0, 120),
          }))
        );
      }
    }

    // Policies + low stock threshold live in the policies row
    if ((body.policies && typeof body.policies === 'object') || typeof body.lowStockThreshold === 'number') {
      const pol = (body.policies ?? {}) as Record<string, unknown>;
      const values: Record<string, unknown> = { updatedAt: new Date() };
      if (typeof pol.deliveryMode === 'string') values.deliveryMode = pol.deliveryMode;
      if (Array.isArray(pol.areas)) values.areas = pol.areas;
      if (pol.freeOver !== undefined) values.freeOver = Math.max(0, num(pol.freeOver));
      if (Array.isArray(pol.payments)) values.payments = pol.payments;
      if (typeof pol.payTiming === 'string') values.payTiming = pol.payTiming.slice(0, 300);
      if (typeof pol.deposits === 'string') values.deposits = pol.deposits.slice(0, 300);
      if (pol.receipts !== undefined) values.receipts = !!pol.receipts;
      if (Array.isArray(pol.warranty)) values.warranty = pol.warranty;
      if (typeof pol.returns === 'string') values.returns = pol.returns.slice(0, 500);
      if (typeof pol.refunds === 'string') values.refunds = pol.refunds.slice(0, 500);
      if (pol.hours && typeof pol.hours === 'object') values.hours = pol.hours;
      if (typeof pol.outOfStockBehavior === 'string') values.outOfStockBehavior = pol.outOfStockBehavior;
      if (pol.restockDays !== undefined) values.restockDays = Math.max(1, num(pol.restockDays));
      if (Array.isArray(pol.custom)) values.custom = pol.custom.map(String).slice(0, 30);
      if (typeof body.lowStockThreshold === 'number') {
        values.lowStockThreshold = Math.max(1, Math.round(body.lowStockThreshold));
      }

      const existing = await db
        .select({ userId: policiesTable.userId })
        .from(policiesTable)
        .where(eq(policiesTable.userId, userRow.id))
        .limit(1);
      if (existing.length) {
        await db.update(policiesTable).set(values).where(eq(policiesTable.userId, userRow.id));
      } else {
        await db.insert(policiesTable).values({ userId: userRow.id, ...values }).onConflictDoNothing();
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Workspace save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}
