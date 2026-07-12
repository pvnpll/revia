"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CreateCardForm } from "@/features/cards/components/create-card-form";
import { useDeck } from "@/features/decks/hooks/use-decks";
import { LessonsSection } from "@/features/lessons/components/lesson-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DeckDetailContent({ deckId }: { deckId: string }) {
  const { data: deck, isLoading, isError, error } = useDeck(deckId);

  if (isLoading) {
    return <p className="text-muted-foreground">Loading deck...</p>;
  }

  if (isError || !deck) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Deck not found"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/decks">
            <ArrowLeft className="h-4 w-4" />
            All Decks
          </Link>
        </Button>
        <div className="flex items-start gap-4">
          <div
            className="mt-2 h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: deck.color }}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deck.title}</h1>
            {deck.subject && <p className="text-muted-foreground">{deck.subject}</p>}
            {deck.description && (
              <p className="mt-2 text-sm text-muted-foreground">{deck.description}</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary">Deck ID: {deck.id.slice(0, 8)}…</Badge>
        </div>
      </div>

      <LessonsSection deckId={deckId} />

      <Card>
        <CardHeader>
          <CardTitle>Add Card</CardTitle>
          <CardDescription>
            Create a new card for this deck. Study cards by opening a lesson above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCardForm deckId={deckId} />
        </CardContent>
      </Card>
    </div>
  );
}
