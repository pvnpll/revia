"use client";

import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";

import { DeckVisibilityToggle } from "@/features/decks/components/deck-visibility-toggle";
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
          {deck.isPublic && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              Public
            </Badge>
          )}
          {!deck.isOwner && (
            <Badge variant="secondary">Shared deck · browse only</Badge>
          )}
        </div>
      </div>

      {deck.isOwner ? (
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
      ) : (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            You are viewing a public deck shared by another learner. You can browse lessons
            and cards, but reviews are not saved to your account.
          </CardContent>
        </Card>
      )}

      <LessonsSection deckId={deckId} readOnly={!deck.isOwner} />
    </div>
  );
}
