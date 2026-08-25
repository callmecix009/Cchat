import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cchat — AI WhatsApp Agent for Small Business",
  description: "Automate WhatsApp replies, run a 24/7 AI agent, and grow your business — all from one dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" className={`${instrumentSans.variable} ${splineMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body bg-surface text-dark">
        {pk ? <ClerkProvider>{children}</ClerkProvider> : children}
      </body>
    </html>
  );
}