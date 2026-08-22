import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, conversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';
import type { Catalog } from '@/lib/workspace';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    conversationId?: string;
    outcome?: string;
    productId?: string;
    productName?: string;
    quantity?: number | string;
    contactName?: string;
    contactPhone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const conversationId = (body?.conversationId || '').trim();
  const outcome = body?.outcome === 'sold' || body?.outcome === 'no' ? body.outcome : null;
  if (!conversationId || !outcome) {
    return NextResponse.json({ error: 'Missing conversationId or outcome' }, { status: 400 });
  }

  const quantityRaw = body?.quantity === undefined ? 1 : Number(body.quantity);
  const quantity = Math.floor(quantityRaw);
  if (!Number.isFinite(quantityRaw) || quantity < 1) {
    return NextResponse.json(
      { error: 'INVALID_QUANTITY', message: 'Quantity must be at least 1.' },
      { status: 400 }
    );
  }

  try {
    const user = await ensureUserRow(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const convo = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    if (!convo.length) {
      await db
        .insert(conversations)
        .values({
          id: conversationId,
          userId: user.id,
          contactName: body?.contactName?.trim() || null,
          contactPhone: body?.contactPhone?.trim() || null,
          status: 'closed',
        })
        .onConflictDoNothing();
    } else if (convo[0].userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fresh = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);
    const row = fresh[0];
    if (!row) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (row.outcome) {
      return NextResponse.json(
        { ok: true, alreadyLogged: true, soldProduct: row.soldProduct, product: null },
        { status: 200 }
      );
    }

    let soldName: string | null = null;
    let updatedProduct: { id: string; name: string; stock: number } | null = null;

    if (outcome === 'sold') {
      const catalog = (user.catalog ?? {}) as Catalog;
      const list = Array.isArray(catalog.products) ? [...catalog.products] : [];

      if (body?.productId) {
        const prod = list.find((p) => p.id === body.productId);
        if (!prod) {
          return NextResponse.json(
            { error: 'PRODUCT_NOT_FOUND', message: 'That product is no longer in your catalog.' },
            { status: 400 }
          );
        }
        if (quantity > prod.stock) {
          return NextResponse.json(
            { error: 'INSUFFICIENT_STOCK', message: `Only ${prod.stock} left in stock — lower the quantity.` },
            { status: 400 }
          );
        }
        prod.stock = Math.max(0, prod.stock - quantity);
        prod.sold = (prod.sold ?? 0) + quantity;
        soldName = prod.name;
        updatedProduct = { id: prod.id, name: prod.name, stock: prod.stock };
        await db
          .update(users)
          .set({ catalog: { ...catalog, products: list }, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
      if (!soldName && typeof body?.productName === 'string' && body.productName.trim()) {
        soldName = body.productName.trim().slice(0, 120);
      }
    }

    await db
      .update(conversations)
      .set({ outcome, soldProduct: soldName })
      .where(eq(conversations.id, conversationId));

    return NextResponse.json({ ok: true, product: updatedProduct, soldProduct: soldName }, { status: 200 });
  } catch (err) {
    console.error('Outcome save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}