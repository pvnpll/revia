"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Save, X } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSaving) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isSaving, onClose]);

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
            cards: cards.map((c) => {
              let combinedNotes = c.notes || "";
              if (c.nuance) {
                combinedNotes = combinedNotes ? `${combinedNotes}\n\nTeacher's Note: ${c.nuance}` : `Teacher's Note: ${c.nuance}`;
              }
              return {
                front: c.front,
                back: c.back,
                pronunciation: c.pronunciation || null,
                exampleSentence: c.example || null,
                notes: combinedNotes || null,
              };
            }),
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
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <Card
        role="dialog"
        aria-modal="true"
        aria-label="Save AI cards as deck"
        className="w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Save as deck</CardTitle>
            <CardDescription>
              Save {cards.length} AI cards into your personal library
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="deck-title">Deck title</Label>
            <Input
              ref={inputRef}
              id="deck-title"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="e.g. Kannada Greetings"
              disabled={isSaving || saved}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {error}
            </p>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-500">
              <Check className="h-4 w-4" aria-hidden />
              Saved to your library!
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving || saved} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || saved} className="w-full font-semibold sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" aria-hidden />
                Save to library
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

