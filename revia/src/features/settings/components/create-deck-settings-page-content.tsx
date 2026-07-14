"use client";

import { CreateDeckForm } from "@/features/decks/components/create-deck-form";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function CreateDeckSettingsPageContent() {
  return (
    <SettingsSubpage
      title="Create deck"
      description="Start a new deck for any subject or language."
    >
      <Card>
        <CardContent className="pt-6">
          <CreateDeckForm />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
