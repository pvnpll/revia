"use client";

import { UsernameSettings } from "@/features/auth/components/username-settings";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function UsernameSettingsPageContent() {
  return (
    <SettingsSubpage
      title="Username"
      description="Your public name on shared decks in Explore."
    >
      <Card>
        <CardContent className="pt-6">
          <UsernameSettings />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
