import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-disp",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "C-chat — AI WhatsApp Agent for Small Business",
  description: "Automate WhatsApp replies, run a 24/7 AI agent, and grow your business — all from one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Missing publishable key is the #1 cause of "This page couldn't load" on
  // /sign-in and /sign-up — Clerk's <SignIn/> requires ClerkProvider.
  // We render a clear config error instead of a cryptic 500.
  if (!pk) {
    return (
      <html lang="en" className={`${bricolage.variable} ${instrumentSans.variable} ${splineMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-body bg-surface text-dark">
          <div className="flex min-h-screen items-center justify-center bg-[#081811] px-6 py-12">
            <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
              <h1 className="font-disp text-xl font-extrabold text-dark">Configuration error</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-dark">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> is not set.
                <br />
                Add it in Vercel → Settings → Environment Variables (Production & Preview) and redeploy.
              </p>
              <p className="mt-3 text-xs text-muted">Auth pages cannot load without Clerk. Check <code className="font-mono">.env.local</code> locally.</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${bricolage.variable} ${instrumentSans.variable} ${splineMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body bg-surface text-dark">
        <ClerkProvider signInFallbackRedirectUrl="/dashboard" signUpFallbackRedirectUrl="/onboarding">{children}</ClerkProvider>
      </body>
    </html>
  );
}