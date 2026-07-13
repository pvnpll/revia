"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { studySurface } from "@/lib/theme/app-theme";
import { RATING_LABELS } from "@/lib/constants/rating-labels";
import type { RatingValue } from "@/lib/scheduler";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { StudyCardItem } from "@/features/study/types";

const ratings: RatingValue[] = [1, 2, 3, 4, 5];

interface StudyCardViewerProps {
  cards: StudyCardItem[];
  currentIndex: number;
  title?: string;
  subtitle?: string;
  onIndexChange: (index: number) => void;
  onRate: (rating: RatingValue) => void | Promise<void>;
  onClose?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  allowFreeNavigation?: boolean;
  fullscreen?: boolean;
}

export function StudyCardViewer({
  cards,
  currentIndex,
  title,
  subtitle,
  onIndexChange,
  onRate,
  onClose,
  isSubmitting = false,
  errorMessage,
  allowFreeNavigation = false,
  fullscreen = true,
}: StudyCardViewerProps) {
  const touchStartY = useRef<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  const current = cards[currentIndex];
  const isRevealed = current ? revealedIds.has(current.id) : false;

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [fullscreen]);

  function revealCurrent() {
    if (!current || isRevealed) return;
    setRevealedIds((prev) => new Set(prev).add(current.id));
  }

  function goToIndex(index: number) {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    if (clamped !== currentIndex) {
      onIndexChange(clamped);
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartY.current = event.touches[0]?.clientY ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const endY = event.changedTouches[0]?.clientY;
    if (endY === undefined) return;

    const delta = touchStartY.current - endY;
    touchStartY.current = null;

    if (delta > 55) {
      if (allowFreeNavigation || isRevealed) {
        goToIndex(currentIndex + 1);
      }
    } else if (delta < -55) {
      goToIndex(currentIndex - 1);
    }
  }

  function handleRating(rating: RatingValue) {
    void onRate(rating);
    if (current) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(current.id);
        return next;
      });
    }
  }

  if (!current) return null;

  const progress = `${currentIndex + 1} / ${cards.length}`;

  return (
    <div
      className={cn(
        "study-viewer flex flex-col",
        fullscreen ? "fixed inset-0 z-[100]" : "min-h-[70vh] rounded-xl border",
        studySurface,
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        {onClose ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <ThemeToggle />
        )}
        <div className="min-w-0 flex-1 px-3 text-center">
          {title && (
            <p className="truncate text-sm font-medium text-muted-foreground">{title}</p>
          )}
          <p className="text-xs text-muted-foreground">{subtitle ?? progress}</p>
        </div>
        <span className="w-10 text-right text-sm font-medium tabular-nums text-muted-foreground">
          {progress}
        </span>
      </header>

      <main className="flex flex-1 flex-col overflow-auto px-6 pb-4">
        {!isRevealed ? (
          <button
            type="button"
            onClick={revealCurrent}
            className="study-card-enter flex flex-1 flex-col items-center justify-center text-center"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Front
            </p>
            <p className="mt-8 max-w-md whitespace-pre-wrap text-4xl font-semibold leading-tight">
              {current.front}
            </p>
            <p className="mt-12 text-sm text-muted-foreground">Tap to reveal</p>
          </button>
        ) : (
          <div className="study-card-enter flex flex-1 flex-col gap-4 py-4">
            <div className="shrink-0 rounded-2xl border bg-muted/50 p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Front
              </p>
              <p className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-snug">
                {current.front}
              </p>
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Back
              </p>
              <p className="study-reveal-back mt-4 whitespace-pre-wrap text-3xl font-semibold leading-tight">
                {current.back}
              </p>
              {(current.pronunciation || current.exampleSentence || current.notes) && (
                <div className="mt-6 space-y-1 border-t pt-4 text-sm text-muted-foreground">
                  {current.pronunciation && <p>{current.pronunciation}</p>}
                  {current.exampleSentence && <p>{current.exampleSentence}</p>}
                  {current.notes && <p>{current.notes}</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {isRevealed && (
        <footer className="shrink-0 border-t bg-background px-4 pb-8 pt-4">
          <div className="grid grid-cols-5 gap-2">
            {ratings.map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRating(rating)}
                className={cn(
                  "flex h-14 flex-col items-center justify-center rounded-xl border bg-card transition-colors active:scale-95 disabled:opacity-50",
                  rating <= 2 && "border-destructive/30",
                  rating === 3 && "border-border",
                  rating >= 4 && "border-primary/30 bg-primary/5",
                )}
              >
                <span className="text-lg font-bold">{rating}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1 text-center text-[9px] leading-tight text-muted-foreground">
            {ratings.map((rating) => (
              <span key={rating}>{RATING_LABELS[rating]}</span>
            ))}
          </div>
          {errorMessage && (
            <p className="mt-3 text-center text-sm text-destructive">{errorMessage}</p>
          )}
        </footer>
      )}
    </div>
  );
}
