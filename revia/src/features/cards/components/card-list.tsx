"use client";

import { useState } from "react";
import { BookOpenCheck, Clock, Pencil } from "lucide-react";

import { CreateCardForm } from "@/features/cards/components/create-card-form";
import { DeleteCardButton } from "@/features/cards/components/delete-card-button";
import { EditCardForm } from "@/features/cards/components/edit-card-form";
import { useCards } from "@/features/cards/hooks/use-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CardWithScheduling } from "@/types/card";

function formatDueDate(value: string | undefined) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function CardListItem({ deckId, card }: { deckId: string; card: CardWithScheduling }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return <EditCardForm deckId={deckId} card={card} onDone={() => setIsEditing(false)} />;
  }

  return (
    <li className="group rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Front
            </p>
            <p className="whitespace-pre-wrap font-medium">{card.front}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Back
            </p>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{card.back}</p>
          </div>
          {(card.pronunciation || card.exampleSentence || card.notes) && (
            <div className="space-y-1 text-sm text-muted-foreground">
              {card.pronunciation && <p>Pronunciation: {card.pronunciation}</p>}
              {card.exampleSentence && <p>Example: {card.exampleSentence}</p>}
              {card.notes && <p>Notes: {card.notes}</p>}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
            aria-label="Edit card"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </Button>
          <DeleteCardButton deckId={deckId} cardId={card.id} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {card.lesson ? (
          <Badge variant="secondary">{card.lesson.title}</Badge>
        ) : (
          <Badge variant="outline">No lesson</Badge>
        )}
        {card.isSuspended && (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            Suspended
          </Badge>
        )}
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Due {formatDueDate(card.schedulingState?.dueAt)}
        </Badge>
        {card.schedulingState && (
          <Badge variant="outline">{card.schedulingState.repetitions} reviews</Badge>
        )}
      </div>
    </li>
  );
}

export function CardList({ deckId }: { deckId: string }) {
  const { data: cards, isLoading, isError, error } = useCards(deckId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading cards...</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load cards"}
      </p>
    );
  }

  const items = cards ?? [];

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <BookOpenCheck className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No cards yet. Add one below to start studying this deck.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((card) => (
            <CardListItem key={card.id} deckId={deckId} card={card} />
          ))}
        </ul>
      )}
      <CreateCardForm deckId={deckId} />
    </div>
  );
}

export function CardsSection({ deckId }: { deckId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cards</CardTitle>
        <CardDescription>
          Add study cards, assign them to lessons, and manage their scheduling status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardList deckId={deckId} />
      </CardContent>
    </Card>
  );
}
