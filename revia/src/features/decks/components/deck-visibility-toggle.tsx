"use client";

import { Globe, Lock } from "lucide-react";

import { useUpdateDeck } from "@/features/decks/hooks/use-decks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface DeckVisibilityToggleProps {
  deckId: string;
  isPublic: boolean;
}

export function DeckVisibilityToggle({ deckId, isPublic }: DeckVisibilityToggleProps) {
  const updateDeck = useUpdateDeck(deckId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant={isPublic ? "outline" : "default"}
        size="sm"
        disabled={updateDeck.isPending || !isPublic}
        onClick={() => updateDeck.mutate({ isPublic: false })}
        className="gap-1.5"
      >
        <Lock className="h-3.5 w-3.5" />
        Private
      </Button>
      <Button
        type="button"
        variant={isPublic ? "default" : "outline"}
        size="sm"
        disabled={updateDeck.isPending || isPublic}
        onClick={() => updateDeck.mutate({ isPublic: true })}
        className="gap-1.5"
      >
        <Globe className="h-3.5 w-3.5" />
        Public
      </Button>
      {updateDeck.isError && (
        <p className="w-full text-sm text-destructive">
          {updateDeck.error instanceof Error
            ? updateDeck.error.message
            : "Failed to update visibility"}
        </p>
      )}
      <p
        className={cn(
          "w-full text-xs",
          isPublic ? "text-primary" : "text-muted-foreground",
        )}
      >
        {isPublic
          ? "This deck is visible to everyone in Explore."
          : "Only you can see this deck."}
      </p>
    </div>
  );
}
