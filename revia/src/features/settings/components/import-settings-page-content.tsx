"use client";

import { ImportDeckForm } from "@/features/import/components/import-deck-form";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function ImportSettingsPageContent() {
  return (
    <SettingsSubpage
      title="Import deck"
      description="Upload a JSON or text file to add cards and lessons."
    >
      <Card>
        <CardContent className="pt-6">
          <ImportDeckForm />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
