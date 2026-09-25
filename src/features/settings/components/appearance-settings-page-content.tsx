"use client";

import { ThemeSetting } from "@/components/layout/theme-setting";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function AppearanceSettingsPageContent() {
  return (
    <SettingsSubpage title="Appearance" description="Choose how Revia looks on your device.">
      <Card>
        <CardContent className="pt-6">
          <ThemeSetting />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
