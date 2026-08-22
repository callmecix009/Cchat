import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";
import { clerkTheme } from "@/lib/brand";

function SignInCard() {
  return (
    <SignIn
      appearance={{
        variables: clerkTheme.variables,
        elements: clerkTheme.elements,
      }}
      path="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
    />
  );
}

export default function SignInPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-center text-muted text-sm py-10">Loading sign-in...</div>}>
        <SignInCard />
      </Suspense>
    </AuthShell>
  );
}