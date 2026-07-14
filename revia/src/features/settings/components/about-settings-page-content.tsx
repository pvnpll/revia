"use client";

import { APP_VERSION } from "@/lib/app-version";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function AboutSettingsPageContent() {
  return (
    <SettingsSubpage title="About" description="Learn more about Revia.">
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
          <p>Mobile-first spaced repetition app for flashcard learning.</p>
          <p>Study due cards from Review, organize content in Decks, and track progress on Home.</p>
          <p className="pt-2 text-xs">Revia v{APP_VERSION}</p>
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
