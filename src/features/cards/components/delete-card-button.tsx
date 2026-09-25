"use client";

import { Trash2 } from "lucide-react";

import { useDeleteCard } from "@/features/cards/hooks/use-cards";
import { Button } from "@/components/ui/button";

export function DeleteCardButton({ deckId, cardId }: { deckId: string; cardId: string }) {
  const deleteCard = useDeleteCard(deckId);

  function handleDelete() {
    if (!confirm("Delete this card and its review history?")) return;
    deleteCard.mutate(cardId);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handleDelete}
      disabled={deleteCard.isPending}
      aria-label="Delete card"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
