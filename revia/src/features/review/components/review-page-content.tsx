"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

import { StudyCardViewer } from "@/features/study/components/study-card-viewer";
import type { StudyCardItem } from "@/features/study/types";
import { useDueReviewCards, useRefreshReviewDependencies, useSubmitReview } from "@/features/review/hooks/use-review";
import type { RatingValue } from "@/lib/scheduler";
import type { DueReviewCard } from "@/types/review";
import { Button } from "@/components/ui/button";

function toStudyCard(card: DueReviewCard): StudyCardItem {
  return {
    id: card.id,
    front: card.front,
    back: card.back,
    pronunciation: card.pronunciation,
    exampleSentence: card.exampleSentence,
    notes: card.notes,
    lessonTitle: card.lesson?.title ?? null,
    reviewCount: card.schedulingState?.repetitions ?? 0,
  };
}

function ReviewState({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center px-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-10 w-10" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">{children}</div>
    </div>
  );
}

export function ReviewPageContent() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useDueReviewCards();
  const submitReview = useSubmitReview();
  const refreshDependencies = useRefreshReviewDependencies();
  const [queue, setQueue] = useState<DueReviewCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [sessionComplete, setSessionComplete] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  function exitReview() {
    refreshDependencies();
    router.push("/dashboard");
  }

  useEffect(() => {
    return () => {
      refreshDependencies();
    };
  }, [refreshDependencies]);

  useEffect(() => {
    if (data?.cards) {
      setQueue(data.cards);
      setCurrentIndex(0);
      setSessionComplete(false);
      setStartedAt(Date.now());
    }
  }, [data?.cards]);

  const studyCards = useMemo(() => queue.map(toStudyCard), [queue]);
  const current = queue[currentIndex];

  useEffect(() => {
    setStartedAt(Date.now());
  }, [current?.id]);

  function handleRating(rating: RatingValue) {
    if (!current) return;

    const cardId = current.id;
    const durationMs = Date.now() - startedAt;
    const isLastInQueue = currentIndex + 1 >= queue.length;

    setCompletedCount((count) => count + 1);

    if (isLastInQueue) {
      setIsFetchingMore(true);
      submitReview.mutate(
        { cardId, rating, durationMs },
        {
          onSuccess: async () => {
            const refreshed = await refetch();
            const remaining = refreshed.data?.cards ?? [];
            if (remaining.length > 0) {
              setQueue(remaining);
              setCurrentIndex(0);
              setStartedAt(Date.now());
            } else {
              setSessionComplete(true);
            }
          },
          onSettled: () => {
            setIsFetchingMore(false);
          },
        },
      );
      return;
    }

    setCurrentIndex((index) => index + 1);
    submitReview.mutate({ cardId, rating, durationMs });
  }

  if (isLoading) {
    return (
      <ReviewState onBack={exitReview}>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <p className="mt-6 text-lg font-medium text-muted-foreground">Loading cards...</p>
      </ReviewState>
    );
  }

  if (isError) {
    return (
      <ReviewState onBack={exitReview}>
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to load review cards"}
        </p>
        <Button className="mt-8" onClick={() => refetch()}>
          Try again
        </Button>
      </ReviewState>
    );
  }

  if (sessionComplete || queue.length === 0) {
    return (
      <ReviewState onBack={exitReview}>
        <div className="rounded-full bg-muted p-5">
          <Sparkles className="h-12 w-12 text-primary" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">All caught up</h1>
        <p className="mt-3 max-w-xs text-sm text-muted-foreground">
          {completedCount > 0
            ? `You reviewed ${completedCount} card${completedCount === 1 ? "" : "s"} this session.`
            : "No cards are due right now. Add some decks to get started."}
        </p>
        <Button asChild className="mt-8 h-12 px-8 text-base">
          <Link href="/decks">
            <BookOpen className="h-4 w-4" />
            Browse decks
          </Link>
        </Button>
      </ReviewState>
    );
  }

  const totalDue = data?.totalDue ?? queue.length;

  if (isFetchingMore) {
    return (
      <ReviewState onBack={exitReview}>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <p className="mt-6 text-lg font-medium text-muted-foreground">Loading more cards...</p>
      </ReviewState>
    );
  }

  return (
    <StudyCardViewer
      cards={studyCards}
      currentIndex={currentIndex}
      title="Daily Review"
      subtitle={`${completedCount + 1} of ${completedCount + totalDue} due`}
      onIndexChange={setCurrentIndex}
      onRate={handleRating}
      onClose={exitReview}
      fullscreen
      errorMessage={
        submitReview.isError
          ? submitReview.error instanceof Error
            ? submitReview.error.message
            : "Failed to submit review"
          : null
      }
    />
  );
}
