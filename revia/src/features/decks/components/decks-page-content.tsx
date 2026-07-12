"use client";

import { CreateDeckForm } from "@/features/decks/components/create-deck-form";
import { DeckList } from "@/features/decks/components/deck-list";
import { useDecks } from "@/features/decks/hooks/use-decks";

export function DecksPageContent() {
  const { data: decks = [], isLoading, isError, error } = useDecks();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decks</h1>
        <p className="mt-2 text-muted-foreground">Organize your learning material into decks.</p>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load decks"}
        </p>
      )}

      <DeckList decks={decks} isLoading={isLoading} />
    </div>
  );
}
