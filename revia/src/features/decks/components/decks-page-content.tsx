"use client";

import { CreateDeckForm } from "@/features/decks/components/create-deck-form";
import { DeckList } from "@/features/decks/components/deck-list";
import { useDecks } from "@/features/decks/hooks/use-decks";
import { ImportDeckForm } from "@/features/import/components/import-deck-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

      <Card>
        <CardHeader>
          <CardTitle>Import Deck</CardTitle>
          <CardDescription>Upload a Revia JSON file or a text file containing JSON.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImportDeckForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Deck</CardTitle>
          <CardDescription>Add a deck for any subject, language, or daily practice goal.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateDeckForm />
        </CardContent>
      </Card>
    </div>
  );
}
