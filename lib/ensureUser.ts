import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

export async function ensureUserRow(clerkId: string) {
  const found = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (found.length) return found[0];

  let email = '';
  let name: string | null = null;
  let phone: string | null = null;
  try {
    const client = await clerkClient();
    const cu = await client.users.getUser(clerkId);
    email = cu.emailAddresses?.[0]?.emailAddress ?? '';
    name = [cu.firstName, cu.lastName].filter(Boolean).join(' ') || null;
    phone = cu.phoneNumbers?.[0]?.phoneNumber ?? null;
  } catch (err) {
    console.error('ensureUserRow: Clerk fetch failed:', err);
  }

  await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      clerkId,
      email,
      name,
      phone,
      plan: 'free',
      subscriptionStatus: 'inactive',
    })
    .onConflictDoNothing({ target: users.clerkId });

  const again = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return again[0];
}