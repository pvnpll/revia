"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Compass, LayoutDashboard, Sparkles } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { dashboardApi } from "@/features/dashboard/services/dashboard-api";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { deckApi } from "@/features/decks/services/deck-api";
import { exploreQueryKeys } from "@/features/explore/hooks/use-explore";
import { exploreApi } from "@/features/explore/services/explore-api";
import { practiceQueryKeys } from "@/features/practice/hooks/use-practice";
import { practiceApi } from "@/features/practice/services/practice-api";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, prefetchKey: "dashboard" as const },
  { href: "/practice", label: "Practice", icon: Sparkles, prefetchKey: "practice" as const },
  { href: "/decks", label: "Decks", icon: BookOpen, prefetchKey: "decks" as const },
  { href: "/explore", label: "Explore", icon: Compass, prefetchKey: "explore" as const },
];

function prefetchRoute(
  queryClient: ReturnType<typeof useQueryClient>,
  key: "dashboard" | "decks" | "practice" | "explore" | null,
  isAuthenticated: boolean,
) {
  if (key === "dashboard") {
    void queryClient.prefetchQuery({
      queryKey: dashboardQueryKeys.summary,
      queryFn: () => dashboardApi.getSummary(),
      staleTime: 2 * 60_000,
    });
    return;
  }

  if (key === "decks") {
    void queryClient.prefetchQuery({
      queryKey: deckQueryKeys.all,
      queryFn: () => deckApi.list(),
      staleTime: 5 * 60_000,
    });
    return;
  }

  if (key === "practice") {
    if (!isAuthenticated) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: practiceQueryKeys.cards(),
      queryFn: () => practiceApi.getCards(),
      staleTime: 60_000,
    });
    return;
  }

  if (key === "explore") {
    void queryClient.prefetchQuery({
      queryKey: exploreQueryKeys.list(""),
      queryFn: () => exploreApi.list(""),
      staleTime: 2 * 60_000,
    });
  }
}

export function FloatingNav() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthSession();

  const visibleItems = isAuthenticated
    ? navItems
    : navItems.filter((item) => item.href === "/explore" || item.href === "/practice");

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-around rounded-full border bg-card/95 px-2 py-2 shadow-lg backdrop-blur">
      {visibleItems.map(({ href, label, icon: Icon, prefetchKey }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            aria-label={label}
            onTouchStart={() => prefetchRoute(queryClient, prefetchKey, isAuthenticated)}
            onMouseEnter={() => prefetchRoute(queryClient, prefetchKey, isAuthenticated)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-90",
              active
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        );
      })}
    </nav>
  );
}
