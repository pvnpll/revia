"use client";

import Link from "next/link";
import { Download, Loader2, LogIn } from "lucide-react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { useImportPublicDeck } from "@/features/decks/hooks/use-decks";
import { Button } from "@/components/ui/button";

interface ImportPublicDeckButtonProps {
  deckId: string;
  importedDeckId?: string | null;
}

export function ImportPublicDeckButton({ deckId, importedDeckId }: ImportPublicDeckButtonProps) {
  const { isAuthenticated } = useAuthSession();
  const importDeck = useImportPublicDeck(deckId);
  const redirect = `/decks/${deckId}`;
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(redirect)}`;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild className="w-full sm:w-auto">
          <Link href={loginHref}>
            <LogIn className="h-4 w-4" />
            Sign in to add
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={signupHref}>Create account</Link>
        </Button>
      </div>
    );
  }

  if (importedDeckId) {
    return (
      <Button asChild className="w-full sm:w-auto">
        <Link href={`/decks/${importedDeckId}`}>Open in your library</Link>
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={importDeck.isPending}
        onClick={() => importDeck.mutate()}
      >
        {importDeck.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {importDeck.isPending ? "Adding..." : "Add to library"}
      </Button>
      {importDeck.isError ? (
        <p className="text-sm text-destructive">
          {importDeck.error instanceof Error ? importDeck.error.message : "Import failed"}
        </p>
      ) : null}
    </div>
  );
}
