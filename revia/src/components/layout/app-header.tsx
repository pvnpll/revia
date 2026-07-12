"use client";

import Link from "next/link";
import { GraduationCap, Settings } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function AppHeader() {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">Revia</span>
      </div>
      <Link
        href="/settings"
        aria-label="Settings"
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
      >
        <Settings className="h-4 w-4" />
      </Link>
    </header>
  );
}
