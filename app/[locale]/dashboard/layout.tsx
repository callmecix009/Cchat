export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardShell from "@/components/dashboard-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { isSubscriptionBlocked } from "@/lib/subscription-guard";

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Localized dashboard layout — mirrors `app/(dashboard)/layout.tsx`
 * (auth + shared subscription guard + DashboardShell).
 * Redirect targets stay non-localized (`/sign-in`, `/plan-selection`)
 * because those routes only exist outside `[locale]`.
 */
export default async function LocalizedDashboardLayout({ children, params }: Props) {
  await params; // preserve locale handling; redirects stay non-localized (see above)
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const row = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
    if (row.length && isSubscriptionBlocked(row[0])) {
      redirect("/plan-selection");
    }
  } catch (e: unknown) {
    if ((e as { digest?: string })?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    // On DB error, don't block - allow access to avoid lockout
  }

  return (
    <ThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ThemeProvider>
  );
}
