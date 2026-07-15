"use client";

import Link from "next/link";
import { GraduationCap, LogIn, Settings } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function AppHeader() {
  const { isAuthenticated, isLoading } = useAuthSession();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur",
      )}
    >
      <Link href={isAuthenticated ? "/practice" : "/explore"} className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-lg font-bold tracking-tight">Revia</span>
      </Link>

      {isLoading ? (
        <div className="h-9 w-20" />
      ) : isAuthenticated ? (
        <Link
          href="/settings"
          aria-label="Settings"
          className="flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
        >
          <Settings className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
