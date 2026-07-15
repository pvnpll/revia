"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AppHeader } from "@/components/layout/app-header";
import { FloatingNav } from "@/components/layout/floating-nav";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { prefetchAppData } from "@/lib/query/prefetch-app-data";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuthSession();

  useEffect(() => {
    if (isLoading) return;
    prefetchAppData(queryClient, { authenticated: isAuthenticated });
  }, [queryClient, isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground md:hidden">
      <AppHeader />
      <main className="min-h-screen pb-28 pt-16">
        <div className="px-4 py-5">{children}</div>
      </main>
      <FloatingNav />
    </div>
  );
}
