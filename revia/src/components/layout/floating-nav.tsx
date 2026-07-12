"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, GraduationCap, LayoutDashboard, Search } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/decks", label: "Decks", icon: BookOpen },
  { href: "/review", label: "Review", icon: GraduationCap },
  { href: "/search", label: "Search", icon: Search },
];

export function FloatingNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-around rounded-full border bg-card/95 px-2 py-2 shadow-lg backdrop-blur">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
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
