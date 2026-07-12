"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme, type Theme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ThemeSetting({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  function selectTheme(next: Theme) {
    setTheme(next);
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <Button
        type="button"
        variant={theme === "light" ? "default" : "outline"}
        className="h-11 justify-center gap-2"
        onClick={() => selectTheme("light")}
        aria-label="Switch to light mode"
        aria-pressed={theme === "light"}
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "outline"}
        className="h-11 justify-center gap-2"
        onClick={() => selectTheme("dark")}
        aria-label="Switch to dark mode"
        aria-pressed={theme === "dark"}
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
    </div>
  );
}
