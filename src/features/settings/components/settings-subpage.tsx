"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SettingsSubpageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSubpage({ title, description, children }: SettingsSubpageProps) {
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/settings">
          <ArrowLeft className="h-4 w-4" />
          Settings
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {children}
    </div>
  );
}
