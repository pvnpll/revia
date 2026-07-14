"use client";

import Link from "next/link";
import {
  AtSign,
  ChevronRight,
  Info,
  Palette,
  PlusCircle,
  Upload,
  UserCircle,
} from "lucide-react";

import { APP_VERSION } from "@/lib/app-version";
import { cn } from "@/lib/utils/cn";

const settingsItems = [
  {
    href: "/settings/account",
    label: "Account",
    icon: UserCircle,
  },
  {
    href: "/settings/username",
    label: "Username",
    icon: AtSign,
  },
  {
    href: "/settings/appearance",
    label: "Appearance",
    icon: Palette,
  },
  {
    href: "/settings/import",
    label: "Import deck",
    icon: Upload,
  },
  {
    href: "/settings/create-deck",
    label: "Create deck",
    icon: PlusCircle,
  },
  {
    href: "/settings/about",
    label: "About",
    icon: Info,
  },
] as const;

export function SettingsHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account, appearance, and app preferences.
        </p>
      </div>

      <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
        {settingsItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center justify-between gap-4 px-4 py-4 transition-colors active:bg-accent",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{label}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

      <p className="pb-4 text-center text-xs text-muted-foreground">Revia v{APP_VERSION}</p>
    </div>
  );
}
