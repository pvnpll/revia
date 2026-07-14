"use client";

import Link from "next/link";
import { Download, Loader2 } from "lucide-react";

import { useImportPublicDeck } from "@/features/decks/hooks/use-decks";
import { Button } from "@/components/ui/button";

interface ImportPublicDeckButtonProps {
  deckId: string;
  importedDeckId?: string | null;
}

export function ImportPublicDeckButton({ deckId, importedDeckId }: ImportPublicDeckButtonProps) {
  const importDeck = useImportPublicDeck(deckId);

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
