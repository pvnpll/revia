"use client";

import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

import { DeleteDeckButton } from "@/features/decks/components/delete-deck-button";
import type { DeckWithStats } from "@/types/deck";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DeckListProps {
  decks: DeckWithStats[];
  isLoading?: boolean;
}

export function DeckList({ decks, isLoading }: DeckListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No decks yet. Create your first deck below.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {decks.map((deck) => (
        <DeckListCard key={deck.id} deck={deck} />
      ))}
    </div>
  );
}

function DeckListCard({ deck }: { deck: DeckWithStats }) {
  return (
    <Card className="group relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: deck.color }}
            />
            <div>
              <CardTitle className="text-lg">
                <Link
                  href={`/decks/${deck.id}`}
                  prefetch
                  className="hover:underline"
                >
                  {deck.title}
                </Link>
              </CardTitle>
              {deck.subject && <CardDescription>{deck.subject}</CardDescription>}
            </div>
          </div>
          <DeleteDeckButton deckId={deck.id} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Badge variant="secondary">{deck.cardCount} cards</Badge>
        {deck.dueCount > 0 && (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {deck.dueCount} due
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
