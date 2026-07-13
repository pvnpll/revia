"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, LayoutDashboard, Search } from "lucide-react";

import { dashboardQueryKeys } from "@/features/dashboard/hooks/use-dashboard";
import { dashboardApi } from "@/features/dashboard/services/dashboard-api";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { deckApi } from "@/features/decks/services/deck-api";
import { reviewQueryKeys } from "@/features/review/hooks/use-review";
import { reviewApi } from "@/features/review/services/review-api";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, prefetchKey: "dashboard" as const },
  { href: "/decks", label: "Decks", icon: BookOpen, prefetchKey: "decks" as const },
  { href: "/review", label: "Review", icon: GraduationCap, prefetchKey: "review" as const },
  { href: "/search", label: "Search", icon: Search, prefetchKey: null },
];

function prefetchRoute(
  queryClient: ReturnType<typeof useQueryClient>,
  key: "dashboard" | "decks" | "review" | null,
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

  if (key === "review") {
    void queryClient.prefetchQuery({
      queryKey: reviewQueryKeys.due(),
      queryFn: () => reviewApi.getDueCards({ limit: 20 }),
      staleTime: 30_000,
    });
  }
}

export function FloatingNav() {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-around rounded-full border bg-card/95 px-2 py-2 shadow-lg backdrop-blur">
      {navItems.map(({ href, label, icon: Icon, prefetchKey }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            prefetch
            aria-label={label}
            onTouchStart={() => prefetchRoute(queryClient, prefetchKey)}
            onMouseEnter={() => prefetchRoute(queryClient, prefetchKey)}
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
