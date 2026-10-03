export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardShell from "@/components/dashboard-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { isSubscriptionBlocked } from "@/lib/subscription-guard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (row.length && isSubscriptionBlocked(row[0])) {
      // Launch gate: new/expired accounts join the waitlist instead of the
      // (not yet live) payment flow. Active trials/subs bypass untouched.
      redirect("/waitlist");
    }
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    // On DB error, don't block - allow access to avoid lockout
  }

  return (
    <ThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  );
}
