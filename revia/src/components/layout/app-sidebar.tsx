"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  GraduationCap,
  LayoutDashboard,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, ready: true },
  { href: "/decks", label: "Decks", icon: BookOpen, ready: true },
  { href: "/review", label: "Review", icon: GraduationCap, ready: true },
  { href: "/explore", label: "Explore", icon: Compass, ready: true },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">Revia</span>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Mobile
        </span>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-background/95 px-2 pb-3 pt-2 backdrop-blur">
        {navItems.map(({ href, label, icon: Icon, ready }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {!ready && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function LegacyAppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-14 items-center gap-2 px-6">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold tracking-tight">Revia</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {navItems.map(({ href, label, icon: Icon, ready }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !ready && !active && "opacity-60",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
              {!ready && href !== "/decks" && (
                <span className="text-[10px] text-muted-foreground">soon</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
