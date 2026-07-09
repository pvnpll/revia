"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCard } from "@/features/cards/hooks/use-cards";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCardSchema, type CreateCardInput } from "@/lib/validators/card.schema";

export function CreateCardForm({ deckId }: { deckId: string }) {
  const createCard = useCreateCard(deckId);
  const { data: lessons = [] } = useLessons(deckId);

  const form = useForm<CreateCardInput>({
    resolver: zodResolver(createCardSchema),
    defaultValues: {
      lessonId: null,
      front: "",
      back: "",
      pronunciation: "",
      exampleSentence: "",
      notes: "",
      imageUrl: "",
      audioUrl: "",
    },
  });

  async function onSubmit(values: CreateCardInput) {
    await createCard.mutateAsync({
      ...values,
      lessonId: values.lessonId || null,
      pronunciation: values.pronunciation || null,
      exampleSentence: values.exampleSentence || null,
      notes: values.notes || null,
      imageUrl: values.imageUrl || null,
      audioUrl: values.audioUrl || null,
    });
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="card-front">Front</Label>
          <Textarea
            id="card-front"
            {...form.register("front")}
            placeholder="Prompt, question, or term"
          />
          {form.formState.errors.front && (
            <p className="text-sm text-destructive">{form.formState.errors.front.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="card-back">Back</Label>
          <Textarea id="card-back" {...form.register("back")} placeholder="Answer or explanation" />
          {form.formState.errors.back && (
            <p className="text-sm text-destructive">{form.formState.errors.back.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="card-lesson">Lesson</Label>
          <select
            id="card-lesson"
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
          <Label htmlFor="card-pronunciation">Pronunciation</Label>
          <Input id="card-pronunciation" {...form.register("pronunciation")} placeholder="Optional" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-example">Example sentence</Label>
        <Textarea id="card-example" {...form.register("exampleSentence")} placeholder="Optional" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="card-notes">Notes</Label>
        <Textarea id="card-notes" {...form.register("notes")} placeholder="Optional" />
      </div>

      {createCard.isError && (
        <p className="text-sm text-destructive">
          {createCard.error instanceof Error ? createCard.error.message : "Failed to create card"}
        </p>
      )}

      <Button type="submit" disabled={createCard.isPending}>
        {createCard.isPending ? "Adding..." : "Add Card"}
      </Button>
    </form>
  );
}
