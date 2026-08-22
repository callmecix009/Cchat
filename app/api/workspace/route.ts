import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getWorkspaceForClerkUser } from '@/lib/workspace';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { ensureUserRow } from '@/lib/ensureUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  let body: any;
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
    const next: any = { ...((userRow.catalog ?? {}) as any) };
    if (Array.isArray(body.products)) next.products = body.products;
    if (Array.isArray(body.services)) next.services = body.services;
    if (typeof body.lowStockThreshold === 'number') {
      next.lowStockThreshold = Math.max(1, Math.round(body.lowStockThreshold));
    }
    await db
      .update(users)
      .set({ catalog: next, updatedAt: new Date() })
      .where(eq(users.id, userRow.id));
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Workspace save error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}