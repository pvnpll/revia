"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

import { useAccountProfile } from "@/features/auth/hooks/use-account";
import { Button } from "@/components/ui/button";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function AccountSettings() {
  const router = useRouter();
  const { data: profile, isLoading } = useAccountProfile();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!isSupabaseAuthEnabled()) {
      return;
    }

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  if (!isSupabaseAuthEnabled()) {
    return null;
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/explore");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading account...</p>
        ) : (
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Signed in as{" "}
              <span className="font-medium text-foreground">{email ?? profile?.email ?? "Unknown user"}</span>
            </p>
          </div>
        )}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <LogOut className="h-4 w-4" />
        {signingOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
