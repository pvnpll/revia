"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateLesson } from "@/features/lessons/hooks/use-lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLessonSchema, type CreateLessonInput } from "@/lib/validators/lesson.schema";

export function CreateLessonForm({ deckId }: { deckId: string }) {
  const createLesson = useCreateLesson(deckId);

  const form = useForm<CreateLessonInput>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: { title: "" },
  });

  async function onSubmit(values: CreateLessonInput) {
    await createLesson.mutateAsync(values);
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="lesson-title">New lesson</Label>
        <Input
          id="lesson-title"
          {...form.register("title")}
          placeholder="e.g. Introduction, Chapter 1"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>
      {createLesson.isError && (
        <p className="text-sm text-destructive sm:col-span-2">
          {createLesson.error instanceof Error
            ? createLesson.error.message
            : "Failed to create lesson"}
        </p>
      )}
      <Button type="submit" disabled={createLesson.isPending} className="sm:w-auto">
        {createLesson.isPending ? "Adding..." : "Add Lesson"}
      </Button>
    </form>
  );
}
