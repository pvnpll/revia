"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useUpdateCard } from "@/features/cards/hooks/use-cards";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCardSchema, type UpdateCardInput } from "@/lib/validators/card.schema";
import type { CardWithScheduling } from "@/types/card";

interface EditCardFormProps {
  deckId: string;
  card: CardWithScheduling;
  onDone: () => void;
}

export function EditCardForm({ deckId, card, onDone }: EditCardFormProps) {
  const updateCard = useUpdateCard(deckId);
  const { data: lessons = [] } = useLessons(deckId);

  const form = useForm<UpdateCardInput>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      lessonId: card.lessonId,
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation ?? "",
      exampleSentence: card.exampleSentence ?? "",
      notes: card.notes ?? "",
      imageUrl: card.imageUrl ?? "",
      audioUrl: card.audioUrl ?? "",
      isSuspended: card.isSuspended,
    },
  });

  useEffect(() => {
    form.reset({
      lessonId: card.lessonId,
      front: card.front,
      back: card.back,
      pronunciation: card.pronunciation ?? "",
      exampleSentence: card.exampleSentence ?? "",
      notes: card.notes ?? "",
      imageUrl: card.imageUrl ?? "",
      audioUrl: card.audioUrl ?? "",
      isSuspended: card.isSuspended,
    });
  }, [card, form]);

  async function onSubmit(values: UpdateCardInput) {
    await updateCard.mutateAsync({
      cardId: card.id,
      input: {
        ...values,
        lessonId: values.lessonId || null,
        pronunciation: values.pronunciation || null,
        exampleSentence: values.exampleSentence || null,
        notes: values.notes || null,
        imageUrl: values.imageUrl || null,
        audioUrl: values.audioUrl || null,
      },
    });
    onDone();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`edit-front-${card.id}`}>Front</Label>
          <Textarea id={`edit-front-${card.id}`} {...form.register("front")} />
          {form.formState.errors.front && (
            <p className="text-sm text-destructive">{form.formState.errors.front.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edit-back-${card.id}`}>Back</Label>
          <Textarea id={`edit-back-${card.id}`} {...form.register("back")} />
          {form.formState.errors.back && (
            <p className="text-sm text-destructive">{form.formState.errors.back.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`edit-lesson-${card.id}`}>Lesson</Label>
          <select
            id={`edit-lesson-${card.id}`}
            {...form.register("lessonId", { setValueAs: (value) => value || null })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">No lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`edit-pronunciation-${card.id}`}>Pronunciation</Label>
          <Input id={`edit-pronunciation-${card.id}`} {...form.register("pronunciation")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-example-${card.id}`}>Example sentence</Label>
        <Textarea id={`edit-example-${card.id}`} {...form.register("exampleSentence")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`edit-notes-${card.id}`}>Notes</Label>
        <Textarea id={`edit-notes-${card.id}`} {...form.register("notes")} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...form.register("isSuspended")} />
        Suspend this card
      </label>

      {updateCard.isError && (
        <p className="text-sm text-destructive">
          {updateCard.error instanceof Error ? updateCard.error.message : "Failed to update card"}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={updateCard.isPending}>
          {updateCard.isPending ? "Saving..." : "Save Card"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
