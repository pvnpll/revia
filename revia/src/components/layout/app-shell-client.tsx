"use client";

import { AppHeader } from "@/components/layout/app-header";
import { FloatingNav } from "@/components/layout/floating-nav";

export function AppShellClient({ children }: { children: React.ReactNode }) {
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
