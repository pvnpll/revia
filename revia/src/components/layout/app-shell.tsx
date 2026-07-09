import { AppSidebar } from "@/components/layout/app-sidebar";

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

      <div className="min-h-screen bg-background md:hidden">
        <AppSidebar />
        <main className="pb-24 pt-16">
          <div className="px-4 py-5">{children}</div>
        </main>
      </div>
    </>
  );
}
