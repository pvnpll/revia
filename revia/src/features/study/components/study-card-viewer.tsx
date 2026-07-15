"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { studySurface } from "@/lib/theme/app-theme";
import { PRACTICE_RATING_PROMPT, RATING_LABELS } from "@/lib/constants/rating-labels";
import { RATING_BORDER_STYLES } from "@/lib/constants/rating-colors";
import type { RatingValue } from "@/lib/scheduler";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { StudyCardItem } from "@/features/study/types";

const ratings: RatingValue[] = [1, 2, 3, 4, 5];
const SWIPE_THRESHOLD_PX = 48;
const TAP_THRESHOLD_PX = 12;

type StudyMode = "practice" | "review";
type NavigationMode = "ratings" | "swipe";

interface StudyCardViewerProps {
  cards: StudyCardItem[];
  currentIndex: number;
  title?: string;
  subtitle?: string;
  mode?: StudyMode;
  navigationMode?: NavigationMode;
  onIndexChange: (index: number) => void;
  onRate: (rating: RatingValue) => void | Promise<void>;
  onClose?: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  allowFreeNavigation?: boolean;
  fullscreen?: boolean;
  readOnly?: boolean;
}

export function StudyCardViewer({
  cards,
  currentIndex,
  title,
  subtitle,
  mode = "review",
  navigationMode = "ratings",
  onIndexChange,
  onRate,
  onClose,
  isSubmitting = false,
  errorMessage,
  allowFreeNavigation = false,
  fullscreen = true,
  readOnly = false,
}: StudyCardViewerProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());

  const current = cards[currentIndex];
  const isRevealed = current ? revealedIds.has(current.id) : false;
  const isSwipeNavigation = navigationMode === "swipe";
  const progress = `${currentIndex + 1} / ${cards.length}`;

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [fullscreen]);

  useEffect(() => {
    setRevealedIds(new Set());
  }, [current?.id]);

  function resetRevealState() {
    setRevealedIds(new Set());
  }

  function revealCurrent() {
    if (!current || isRevealed) return;
    setRevealedIds((prev) => new Set(prev).add(current.id));
  }

  function goToIndex(index: number) {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    if (clamped !== currentIndex) {
      resetRevealState();
      onIndexChange(clamped);
    }
  }

  function goNext() {
    goToIndex(currentIndex + 1);
  }

  function goPrevious() {
    goToIndex(currentIndex - 1);
  }

  function handleEdgeTap(clientX: number) {
    const main = mainRef.current;
    if (!main) return;

    const rect = main.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const canNavigateByTap = isSwipeNavigation || allowFreeNavigation;

    if (x < width * 0.25) {
      if (canNavigateByTap) {
        goPrevious();
      }
      return;
    }

    if (x > width * 0.75) {
      if (canNavigateByTap) {
        goNext();
      }
      return;
    }

    if (!isRevealed) {
      revealCurrent();
    }
  }

  function handleTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStart.current === null) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const startX = touchStart.current.x;
    touchStart.current = null;

    if (isSwipeNavigation) {
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
          goNext();
        } else {
          goPrevious();
        }
        return;
      }

      if (Math.abs(deltaX) < TAP_THRESHOLD_PX && Math.abs(deltaY) < TAP_THRESHOLD_PX) {
        handleEdgeTap(startX);
      }
      return;
    }

    if (mode === "practice") {
      if (Math.abs(deltaX) < TAP_THRESHOLD_PX && Math.abs(deltaY) < TAP_THRESHOLD_PX) {
        handleEdgeTap(startX);
      }
      return;
    }

    if (deltaY > 55) {
      if (allowFreeNavigation || isRevealed) {
        goNext();
      }
    } else if (deltaY < -55) {
      goPrevious();
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

  const headerSubtitle =
    subtitle ??
    (isSwipeNavigation ? progress : mode === "practice" ? "Practice mode" : progress);

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
          <p className="text-xs text-muted-foreground">{headerSubtitle}</p>
        </div>
        <span className="w-10 text-right text-sm font-medium tabular-nums text-muted-foreground">
          {progress}
        </span>
      </header>

      <main
        ref={mainRef}
        className="relative flex flex-1 flex-col overflow-hidden px-6 pb-4"
        style={isSwipeNavigation || mode === "practice" ? { touchAction: "pan-y" } : undefined}
      >
        {isSwipeNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous card"
              className="absolute inset-y-0 left-0 z-20 w-1/4"
              onClick={goPrevious}
            />
            <button
              type="button"
              aria-label="Next card"
              className="absolute inset-y-0 right-0 z-20 w-1/4"
              onClick={goNext}
            />
          </>
        )}

        {!isRevealed ? (
          <button
            type="button"
            onClick={revealCurrent}
            className={cn(
              "study-card-enter flex flex-1 flex-col items-center justify-center text-center",
              isSwipeNavigation && "relative z-10 mx-auto w-1/2 min-w-0",
            )}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {mode === "practice" ? "Question" : "Front"}
            </p>
            <p className="mt-8 max-w-md whitespace-pre-wrap text-4xl font-semibold leading-tight">
              {current.front}
            </p>
            <p className="mt-12 text-sm text-muted-foreground">Tap to reveal</p>
          </button>
        ) : (
          <div
            className={cn(
              "study-card-enter flex flex-1 flex-col gap-4 overflow-auto py-4",
              isSwipeNavigation && "relative z-10",
            )}
          >
            <div className="shrink-0 rounded-2xl border bg-muted/50 p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {mode === "practice" ? "Question" : "Front"}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-snug">
                {current.front}
              </p>
            </div>

            <div className="flex flex-1 flex-col rounded-2xl border bg-card p-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Answer
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

      {isSwipeNavigation ? (
        <footer className="shrink-0 border-t bg-background px-4 pb-8 pt-3 text-center text-xs text-muted-foreground">
          Swipe or tap left/right for previous and next · tap center to reveal
        </footer>
      ) : null}

      {!isSwipeNavigation && isRevealed && (
        <footer className="shrink-0 border-t bg-background px-4 pb-8 pt-4">
          {readOnly ? (
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                if (currentIndex + 1 >= cards.length) {
                  onClose?.();
                  return;
                }
                goNext();
              }}
            >
              {currentIndex + 1 >= cards.length ? "Done" : "Next card"}
            </Button>
          ) : (
            <>
              <p className="mb-3 text-center text-sm font-medium text-muted-foreground">
                {mode === "practice" ? PRACTICE_RATING_PROMPT : "Rate this card"}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {ratings.map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleRating(rating)}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center rounded-xl border bg-card transition-colors active:scale-95 disabled:opacity-50",
                      RATING_BORDER_STYLES[rating],
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
            </>
          )}
        </footer>
      )}
    </div>
  );
}
