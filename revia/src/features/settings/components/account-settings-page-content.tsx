"use client";

import { AccountSettings } from "@/features/auth/components/account-settings";
import { UsernameSettings } from "@/features/auth/components/username-settings";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function AccountSettingsPageContent() {
  return (
    <SettingsSubpage
      title="Account"
      description="Manage your profile, username, and session."
    >
      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Your signed-in account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription>
            Shown on public decks you publish and on decks you import from others.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsernameSettings />
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
