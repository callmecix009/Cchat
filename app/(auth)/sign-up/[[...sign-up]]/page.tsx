export const dynamic = "force-dynamic";

import Link from "next/link";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { clerkTheme } from "@/lib/brand";

function SignUpCard() {
  return (
    <SignUp
      appearance={{
        variables: clerkTheme.variables,
        elements: clerkTheme.elements,
      }}
      path="/sign-up"
      signInUrl="/sign-in"
      afterSignUpUrl="/onboarding"
    />
  );
}

export default function SignUpPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-center text-muted text-sm py-10">Loading sign-up...</div>}>
        <SignUpCard />
      </Suspense>
      <p className="text-[12px] text-muted text-center mt-4 leading-[1.6]">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline hover:text-lime transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline hover:text-lime transition-colors">Privacy Policy</Link>.
        You also agree to comply with our{" "}
        <Link href="/acceptable-use" className="underline hover:text-lime transition-colors">Acceptable Use Policy</Link>.
      </p>
    </AuthShell>
  );
}