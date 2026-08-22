import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';

async function verifyWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return true; // if no secret configured, allow (dev mode)

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) return false;

  // Reject timestamps older than 5 minutes
  const ts = parseInt(svixTimestamp, 10);
  if (Number.isNaN(ts)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(signedContent)
  );

  const expected = Buffer.from(signature).toString('base64');

  // svix sends multiple signatures separated by spaces, e.g. "v1,abc v1,def"
  const candidates = svixSignature.split(' ').map((s) => s.trim());
  return candidates.some((c) => {
    const [version, sig] = c.split(',');
    return version === 'v1' && sig === expected;
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!(await verifyWebhook(req, rawBody))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { type, data } = payload;

  try {
    if (type === 'user.created' || type === 'user.updated') {
      const email = data.email_addresses?.[0]?.email_address ?? '';
      const firstName = data.first_name ?? '';
      const lastName = data.last_name ?? '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || null;
      const phone = data.phone_numbers?.[0]?.phone_number ?? null;

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, data.id))
        .limit(1);

      if (existing.length) {
        await db
          .update(users)
          .set({
            email,
            name,
            phone,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, data.id));
      } else {
        await db.insert(users).values({
          id: crypto.randomUUID(),
          clerkId: data.id,
          email,
          name,
          phone,
        });
      }
    }

    if (type === 'user.deleted') {
      await db.delete(users).where(eq(users.clerkId, data.id));
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err: any) {
    console.error('Webhook sync error:', err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}