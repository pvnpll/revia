"use client";

import Link from "next/link";
import { ArrowLeft, Globe, UserRound } from "lucide-react";

import { DeckVisibilityToggle } from "@/features/decks/components/deck-visibility-toggle";
import { ImportPublicDeckButton } from "@/features/decks/components/import-public-deck-button";
import { useDeck } from "@/features/decks/hooks/use-decks";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { LessonsSection } from "@/features/lessons/components/lesson-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DeckDetailContent({ deckId }: { deckId: string }) {
  const { data: deck, isLoading: deckLoading, isError, error } = useDeck(deckId);
  useLessons(deckId);

  if (deckLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !deck) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Deck not found"}
      </p>
    );
  }

  const backHref = deck.isOwner ? "/decks" : "/explore";
  const backLabel = deck.isOwner ? "All Decks" : "Explore";
  const creditedAuthor = deck.sourceAuthorUsername ?? deck.authorUsername;

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
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
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {deck.isPublic && deck.isOwner && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Public
            </Badge>
          )}
          {creditedAuthor && (
            <Badge variant="secondary" className="gap-1">
              <UserRound className="h-3 w-3" />@{creditedAuthor}
            </Badge>
          )}
        </div>
      </div>

      {deck.isOwner ? (
        <>
          {deck.sourceAuthorUsername ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Originally by @{deck.sourceAuthorUsername}. Study and review here — your progress
                is saved to your library.
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
              <CardDescription>
                Choose whether this deck appears in Explore for other learners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeckVisibilityToggle deckId={deckId} isPublic={deck.isPublic} />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Add to your library</CardTitle>
            <CardDescription>
              Import this deck to study, review, and save your own progress. The original author
              stays credited on your copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportPublicDeckButton deckId={deckId} importedDeckId={deck.importedDeckId} />
          </CardContent>
        </Card>
      )}

      <LessonsSection deckId={deckId} readOnly={!deck.isOwner} />
    </div>
  );
}
