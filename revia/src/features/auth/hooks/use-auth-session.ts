"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";

export function useAuthSession() {
  const authEnabled = isSupabaseAuthEnabled();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) {
      return;
    }

    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [authEnabled]);

  return {
    isAuthenticated: authEnabled ? Boolean(session) : true,
    isLoading: authEnabled ? isLoading : false,
    session,
  };
}
