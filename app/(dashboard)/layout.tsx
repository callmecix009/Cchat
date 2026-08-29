export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardShell from "@/components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (row.length) {
      const u = row[0];
      if (u.isDemoOwner) {
        // Demo account bypasses subscription gate
      } else {
        const status = u.subscriptionStatus || "inactive";
        const trialEnds = u.trialEndsAt ? new Date(u.trialEndsAt).getTime() : 0;
        const subEnds = u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : 0;
        const now = Date.now();
        const trialExpired = status === "trialing" && trialEnds > 0 && trialEnds <= now;
        const isExpired = status === "expired" || trialExpired;
        const isBlocked = status === "inactive" || status === "canceled" || isExpired || (status === "active" && subEnds > 0 && subEnds <= now);

        if (isBlocked) {
          redirect("/plan-selection");
        }
      }
    }
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    // On DB error, don't block - allow access to avoid lockout
  }

  return <DashboardShell>{children}</DashboardShell>;
}
