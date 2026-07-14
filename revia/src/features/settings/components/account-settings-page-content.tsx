"use client";

import { AccountSettings } from "@/features/auth/components/account-settings";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent } from "@/components/ui/card";

export function AccountSettingsPageContent() {
  return (
    <SettingsSubpage
      title="Account"
      description="View your signed-in session and sign out."
    >
      <Card>
        <CardContent className="pt-6">
          <AccountSettings />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
