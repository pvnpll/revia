"use client";

import { Trash2 } from "lucide-react";

import { useDeleteDeck } from "@/features/decks/hooks/use-decks";
import { Button } from "@/components/ui/button";

export function DeleteDeckButton({ deckId }: { deckId: string }) {
  const deleteDeck = useDeleteDeck();

  function handleDelete() {
    if (!confirm("Delete this deck and all its cards?")) return;
    deleteDeck.mutate(deckId);
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleteDeck.isPending}
      aria-label="Delete deck"
    >
      <Trash2 className="h-4 w-4" />
      Delete
    </Button>
  );
}
