"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface InlineTitleEditorProps {
  value: string;
  onSave: (title: string) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
  className?: string;
  titleClassName?: string;
  disabled?: boolean;
}

export function InlineTitleEditor({
  value,
  onSave,
  isSaving = false,
  error = null,
  className,
  titleClassName,
  disabled = false,
}: InlineTitleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setDraft(value);
      setEditing(false);
      return;
    }

    await onSave(trimmed);
    setEditing(false);
  }

  if (disabled) {
    return <span className={titleClassName}>{value}</span>;
  }

  if (editing) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            disabled={isSaving}
            className="h-10"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSave();
              }
              if (event.key === "Escape") {
                setDraft(value);
                setEditing(false);
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={isSaving || draft.trim().length === 0}
            onClick={() => void handleSave()}
            aria-label="Save title"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            disabled={isSaving}
            onClick={() => {
              setDraft(value);
              setEditing(false);
            }}
            aria-label="Cancel editing"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className={titleClassName}>{value}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => setEditing(true)}
        aria-label="Edit title"
      >
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}
