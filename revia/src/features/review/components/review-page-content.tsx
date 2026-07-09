"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";

import { useDueReviewCards, useSubmitReview } from "@/features/review/hooks/use-review";
import { RATING_LABELS, RATING_SHORT_LABELS } from "@/lib/constants/rating-labels";
import type { RatingValue } from "@/lib/scheduler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ratings: RatingValue[] = [1, 2, 3, 4, 5];

function formatNextDue(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

export function ReviewPageContent() {
  const { data, isLoading, isError, error, refetch } = useDueReviewCards();
  const submitReview = useSubmitReview();
  const [completedCount, setCompletedCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [lastResult, setLastResult] = useState<string | null>(null);

  const cards = useMemo(() => data?.cards ?? [], [data?.cards]);
  const current = cards[0];

  useEffect(() => {
    setRevealed(false);
    setStartedAt(Date.now());
  }, [current?.id]);

  async function handleRating(rating: RatingValue) {
    if (!current) return;
    const result = await submitReview.mutateAsync({
      cardId: current.id,
      rating,
      durationMs: Date.now() - startedAt,
    });
    setCompletedCount((count) => count + 1);
    setLastResult(`Next review: ${formatNextDue(result.nextDueAt)}`);
    await refetch();
  }

  if (isLoading) return <p className="text-muted-foreground">Loading due cards...</p>;

  if (isError) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Failed to load review cards"}
      </p>
    );
  }

  if (!current) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All caught up</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {completedCount > 0
                ? `You reviewed ${completedCount} card${completedCount === 1 ? "" : "s"} today.`
                : "No cards are due right now."}
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/decks">Add or browse cards</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalDue = data?.totalDue ?? cards.length;
  const progressLabel = `${completedCount + 1} of ${completedCount + totalDue}`;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daily Review</h1>
            <p className="mt-1 text-sm text-muted-foreground">Review cards due now.</p>
          </div>
          <Badge variant="secondary">{progressLabel}</Badge>
        </div>
        {lastResult && <p className="mt-2 text-xs text-muted-foreground">{lastResult}</p>}
      </div>

      <Card className="min-h-[360px]">
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            {current.lesson ? <Badge variant="secondary">{current.lesson.title}</Badge> : <Badge variant="outline">No lesson</Badge>}
            <Badge variant="outline">{current.schedulingState?.repetitions ?? 0} reviews</Badge>
          </div>
          <CardDescription>Front</CardDescription>
          <CardTitle className="whitespace-pre-wrap text-2xl leading-snug">{current.front}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {revealed ? (
            <div className="space-y-4 rounded-2xl bg-muted p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Back</p>
              <p className="whitespace-pre-wrap text-lg font-medium">{current.back}</p>
              {current.pronunciation && <p className="text-sm text-muted-foreground">Pronunciation: {current.pronunciation}</p>}
              {current.exampleSentence && <p className="text-sm text-muted-foreground">Example: {current.exampleSentence}</p>}
              {current.notes && <p className="text-sm text-muted-foreground">Notes: {current.notes}</p>}
            </div>
          ) : (
            <Button size="lg" className="h-14 w-full text-base" onClick={() => setRevealed(true)}>
              Reveal Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {revealed && (
        <div className="space-y-3">
          <p className="text-center text-sm font-medium">How well did you remember it?</p>
          <div className="grid grid-cols-1 gap-2">
            {ratings.map((rating) => (
              <Button
                key={rating}
                variant={rating <= 2 ? "secondary" : "default"}
                disabled={submitReview.isPending}
                className="h-12 justify-between"
                onClick={() => handleRating(rating)}
              >
                <span>{RATING_LABELS[rating]}</span>
                <span className="text-xs opacity-80">{RATING_SHORT_LABELS[rating]}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {submitReview.isError && (
        <p className="text-sm text-destructive">
          {submitReview.error instanceof Error ? submitReview.error.message : "Failed to submit review"}
        </p>
      )}

      <Button variant="ghost" className="w-full" onClick={() => refetch()}>
        <RotateCcw className="h-4 w-4" />
        Refresh due cards
      </Button>
    </div>
  );
}
