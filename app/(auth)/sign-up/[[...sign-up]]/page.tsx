export const dynamic = "force-dynamic";

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
    </AuthShell>
  );
}