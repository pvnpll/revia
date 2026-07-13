import { Suspense } from "react";

import { AuthForm } from "@/features/auth/components/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
