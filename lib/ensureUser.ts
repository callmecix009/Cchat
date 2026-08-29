import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

const DEMO_EMAILS = new Set([
  "chrrispinmatiko1974@gmail.com",
  "chrispinmatiko1974@gmail.com",
  "chrispinchacha66@gmail.com",
]);

function isDemoEmail(email: string) {
  return DEMO_EMAILS.has(email.trim().toLowerCase());
}

export async function ensureUserRow(clerkId: string) {
  const found = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

  // Fetch Clerk profile to get email for demo check and for updates
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

  if (found.length) {
    const existing = found[0];
    // Auto-upgrade demo accounts on sign-in if email matches list
    if (email && isDemoEmail(email) && !existing.isDemoOwner) {
      try {
        await db.update(users).set({ isDemoOwner: true, updatedAt: new Date() }).where(eq(users.clerkId, clerkId));
        return { ...existing, isDemoOwner: true } as typeof existing;
      } catch {}
    }
    return existing;
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
      isDemoOwner: email ? isDemoEmail(email) : false,
    })
    .onConflictDoNothing({ target: users.clerkId });

  const again = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return again[0];
}