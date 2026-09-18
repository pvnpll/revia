"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Download, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deckQueryKeys } from "@/features/decks/hooks/use-decks";
import { fetchJson } from "@/lib/utils/fetch-json";
import { GeneratedCard } from "@/lib/validators/ai";

interface SaveDeckModalProps {
  topic: string;
  cards: GeneratedCard[];
  onClose: () => void;
  onSaved?: (deckId: string) => void;
}

export function SaveDeckModal({ topic, cards, onClose, onSaved }: SaveDeckModalProps) {
  const queryClient = useQueryClient();
  const [deckTitle, setDeckTitle] = useState(`${topic} (AI)`);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!deckTitle.trim()) {
      setError("Please enter a deck title");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        deck: {
          title: deckTitle.trim(),
          description: `Generated with Revia AI for topic: ${topic}`,
          tags: ["revia-ai", topic.toLowerCase().replace(/\s+/g, "-")],
        },
        lessons: [
          {
            title: topic,
            description: "AI generated cards",
            cards: cards.map((c) => ({
              front: c.front,
              back: c.back,
              pronunciation: c.pronunciation || null,
              exampleSentence: c.example || null,
              notes: c.notes || null,
            })),
          },
        ],
      };

      const result = await fetchJson<{ deckId: string }>("/api/import/deck", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: deckQueryKeys.all });
      setTimeout(() => {
        onSaved?.(result.deckId);
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save deck");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold">Save as Deck</CardTitle>
            <CardDescription>
              Save {cards.length} AI cards into your personal library
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deck-title">Deck Title</Label>
            <Input
              id="deck-title"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g. Kannada Greetings"
              disabled={isSaving || saved}
            />
          </div>

          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          {saved && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-500">
              <Check className="h-4 w-4" />
              Saved to your library!
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving || saved}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || saved} className="gap-2">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Save to Library
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

