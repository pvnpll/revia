"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AppHeader } from "@/components/layout/app-header";
import { FloatingNav } from "@/components/layout/floating-nav";
import { prefetchAppData } from "@/lib/query/prefetch-app-data";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    prefetchAppData(queryClient);
  }, [queryClient]);

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
