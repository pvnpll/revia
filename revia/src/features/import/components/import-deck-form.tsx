"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { useDecks } from "@/features/decks/hooks/use-decks";
import { useImportDeck } from "@/features/import/hooks/use-import-deck";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ImportDeckForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const importDeck = useImportDeck();
  const { data: decks = [] } = useDecks();
  const [fileName, setFileName] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [targetDeckId, setTargetDeckId] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  async function importFromText(text: string) {
    setParseError(null);

    try {
      const parsed = JSON.parse(text);
      const result = await importDeck.mutateAsync({
        ...parsed,
        targetDeckId: targetDeckId || null,
      });
      inputRef.current?.form?.reset();
      router.push(`/decks/${result.deckId}`);
    } catch (error) {
      setParseError(
        error instanceof SyntaxError
          ? "This file is not valid JSON. Upload a .json file or a .txt file containing JSON."
          : error instanceof Error
            ? error.message
            : "Import failed",
      );
    }
  }

  async function handleImport(file: File | undefined) {
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();
    setRawText(text);
    await importFromText(text);
  }

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deck-import">Upload JSON or text file</Label>
        <input
          ref={inputRef}
          id="deck-import"
          type="file"
          accept=".json,.txt,application/json,text/plain"
          className="block w-full rounded-lg border border-dashed border-input bg-background p-4 text-sm"
          onChange={(event) => handleImport(event.target.files?.[0])}
        />
      </div>

      <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        Required JSON fields: deck title, lesson title, card front, and card back.
      </div>

      <div className="space-y-2">
        <Label htmlFor="deck-import-target">Import destination</Label>
        <select
          id="deck-import-target"
          value={targetDeckId}
          onChange={(event) => setTargetDeckId(event.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        >
          <option value="">Create new deck from JSON</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              Add to existing: {deck.title}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Existing deck imports append new lessons and cards to the selected deck.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deck-import-text">Or paste JSON text</Label>
        <Textarea
          id="deck-import-text"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
          placeholder='{"deck":{"title":"Kannada Basics"},"lessons":[...]}'
          className="min-h-32"
        />
      </div>

      {fileName && !parseError && (
        <p className="text-sm text-muted-foreground">
          {importDeck.isPending ? `Importing ${fileName}...` : `Selected ${fileName}`}
        </p>
      )}

      {(parseError || importDeck.isError) && (
        <p className="text-sm text-destructive">
          {parseError ??
            (importDeck.error instanceof Error ? importDeck.error.message : "Import failed")}
        </p>
      )}

      <Button
        type="button"
        disabled={importDeck.isPending || rawText.trim().length === 0}
        onClick={() => importFromText(rawText)}
        className="w-full"
      >
        <Upload className="h-4 w-4" />
        {importDeck.isPending ? "Importing..." : "Import JSON"}
      </Button>
    </form>
  );
}
