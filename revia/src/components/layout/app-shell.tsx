import { AppShellClient } from "@/components/layout/app-shell-client";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="hidden min-h-screen items-center justify-center bg-background p-8 text-center md:flex">
        <div className="max-w-sm space-y-3 rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Revia is mobile-first</h1>
          <p className="text-muted-foreground">
            Please switch to Mobile for better experience.
          </p>
        </div>
      </div>

      <AppShellClient>{children}</AppShellClient>
    </>
  );
}
