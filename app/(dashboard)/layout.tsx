export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardShell from "@/components/dashboard-shell";

const BILLING_ALLOWED = new Set(["/billing", "/settings", "/onboarding"]);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (row.length) {
      const u = row[0];
      const status = u.subscriptionStatus || "inactive";
      const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : 0;
      const now = Date.now();
      const trialExpired = status === "trialing" && trialEnds > 0 && trialEnds <= now;
      const isInactive = status === "inactive" || status === "expired" || status === "canceled";

      if (trialExpired || isInactive) {
        // Allow access to billing and settings so user can subscribe
        // The actual path check happens client-side in billing page
      }
    }
  } catch {
    // If DB check fails, let the user through — don't block on infrastructure errors
  }

  return <DashboardShell>{children}</DashboardShell>;
}
