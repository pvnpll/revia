import { AppShellClient } from "@/components/layout/app-shell-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}
