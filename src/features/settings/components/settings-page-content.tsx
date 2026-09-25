"use client";

import { useEffect } from "react";

import { accountApi } from "@/features/auth/services/account-api";
import { SettingsHub } from "@/features/settings/components/settings-hub";

export function SettingsPageContent() {
  useEffect(() => {
    void accountApi.sync();
  }, []);

  return <SettingsHub />;
}
