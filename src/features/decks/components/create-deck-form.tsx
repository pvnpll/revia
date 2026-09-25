"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateDeck } from "@/features/decks/hooks/use-decks";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDeckSchema, type CreateDeckInput } from "@/lib/validators/deck.schema";

const DECK_COLORS = [
  "#6366f1",
  "#3b82f6",
  "#06b6d4",
  "#10b981",
  "#84cc16",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#64748b",
] as const;

export function CreateDeckForm() {
  const router = useRouter();
  const createDeck = useCreateDeck();

  const form = useForm<CreateDeckInput>({
    resolver: zodResolver(createDeckSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      color: "#6366f1",
    },
  });

  const selectedColor = form.watch("color");

  async function onSubmit(values: CreateDeckInput) {
    const deck = await createDeck.mutateAsync({
      ...values,
      description: values.description || null,
      subject: values.subject || null,
    });
    router.push(`/decks/${deck.id}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...form.register("title")} placeholder="e.g. React Hooks" />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" {...form.register("subject")} placeholder="e.g. React, DSA" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...form.register("description")} placeholder="Optional" />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2.5">
          {DECK_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => form.setValue("color", color, { shouldValidate: true })}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition-transform active:scale-95",
                selectedColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent",
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select ${color}`}
              aria-pressed={selectedColor === color}
            />
          ))}
        </div>
        <input type="hidden" {...form.register("color")} />
      </div>
      {createDeck.isError && (
        <p className="text-sm text-destructive">
          {createDeck.error instanceof Error ? createDeck.error.message : "Failed to create deck"}
        </p>
      )}
      <Button type="submit" disabled={createDeck.isPending}>
        {createDeck.isPending ? "Creating..." : "Create Deck"}
      </Button>
    </form>
  );
}
