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
const SWIPE_THRESHOLD_PX = 72;
const TAP_THRESHOLD_PX = 12;
const GESTURE_LOCK_PX = 10;
const SWIPE_EXIT_MS = 220;

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
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const gestureLocked = useRef<"horizontal" | "vertical" | null>(null);
  const isPointerDragging = useRef(false);

  const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const current = cards[currentIndex];
  const isRevealed = current ? revealedIds.has(current.id) : false;
  const isSwipeNavigation = navigationMode === "swipe";
  const progress = `${currentIndex + 1} / ${cards.length}`;

  const nextIndex =
    cards.length > 0 ? (currentIndex + 1) % cards.length : 0;
  const previousIndex =
    cards.length > 0 ? (currentIndex - 1 + cards.length) % cards.length : 0;
  const nextCard = cards[nextIndex];
  const previousCard = cards[previousIndex];

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
    setDragX(0);
    setIsDragging(false);
    setIsExiting(false);
    pointerStart.current = null;
    gestureLocked.current = null;
    isPointerDragging.current = false;
  }, [current?.id]);

  function resetRevealState() {
    setRevealedIds(new Set());
  }

  function revealCurrent() {
    if (!current || isRevealed) return;
    setRevealedIds((prev) => new Set(prev).add(current.id));
  }

  function goToIndex(index: number) {
    if (cards.length === 0) return;

    const target = isSwipeNavigation
      ? ((index % cards.length) + cards.length) % cards.length
      : Math.max(0, Math.min(index, cards.length - 1));

    if (target !== currentIndex) {
      resetRevealState();
      onIndexChange(target);
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

  function getSwipeThreshold() {
    const width = mainRef.current?.clientWidth ?? 320;
    return Math.min(SWIPE_THRESHOLD_PX, width * 0.22);
  }

  function commitSwipe(direction: "next" | "previous") {
    const width = mainRef.current?.clientWidth ?? 320;
    const exitX = direction === "next" ? -width * 1.15 : width * 1.15;

    setIsDragging(false);
    setIsExiting(true);
    setDragX(exitX);
    isPointerDragging.current = false;
    pointerStart.current = null;
    gestureLocked.current = null;

    window.setTimeout(() => {
      if (direction === "next") {
        goNext();
      } else {
        goPrevious();
      }
      setDragX(0);
      setIsExiting(false);
    }, SWIPE_EXIT_MS);
  }

  function resetDrag(animateSnapBack = false) {
    setIsDragging(false);
    isPointerDragging.current = false;
    pointerStart.current = null;
    gestureLocked.current = null;

    if (animateSnapBack) {
      requestAnimationFrame(() => setDragX(0));
      return;
    }

    setDragX(0);
  }

  function handleSwipePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isExiting || cards.length <= 1) return;

    pointerStart.current = { x: event.clientX, y: event.clientY };
    gestureLocked.current = null;
    isPointerDragging.current = true;
    setIsDragging(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleSwipePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isPointerDragging.current || isExiting || pointerStart.current === null) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;

    if (gestureLocked.current === null) {
      if (
        Math.abs(deltaX) < GESTURE_LOCK_PX &&
        Math.abs(deltaY) < GESTURE_LOCK_PX
      ) {
        return;
      }
      gestureLocked.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    if (gestureLocked.current === "vertical") return;

    event.preventDefault();
    setIsDragging(true);
    setDragX(deltaX);
  }

  function handleSwipePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isPointerDragging.current || pointerStart.current === null) return;

    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    const startX = pointerStart.current.x;
    const threshold = getSwipeThreshold();
    const wasHorizontal = gestureLocked.current === "horizontal";

    if (wasHorizontal && Math.abs(deltaX) >= threshold) {
      if (deltaX < 0) {
        commitSwipe("next");
      } else {
        commitSwipe("previous");
      }
      return;
    }

    if (
      Math.abs(deltaX) < TAP_THRESHOLD_PX &&
      Math.abs(deltaY) < TAP_THRESHOLD_PX
    ) {
      handleEdgeTap(startX);
      resetDrag();
      return;
    }

    resetDrag(true);
  }

  function handleSwipePointerCancel() {
    resetDrag();
  }

  function handleTouchStart(event: React.TouchEvent) {
    if (isSwipeNavigation) return;
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (isSwipeNavigation) return;
    if (touchStart.current === null) return;
    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const startX = touchStart.current.x;
    touchStart.current = null;

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

  function renderCardBody(card: StudyCardItem, revealed: boolean) {
    if (!revealed) {
      return (
        <div className="flex h-full flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {mode === "practice" ? "Question" : "Front"}
          </p>
          <p className="mt-8 max-w-md whitespace-pre-wrap text-4xl font-semibold leading-tight">
            {card.front}
          </p>
          <p className="mt-12 text-sm text-muted-foreground">Tap to reveal</p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-1 flex-col gap-4 overflow-auto px-5 py-4">
        <div className="shrink-0 rounded-2xl border bg-muted/50 p-4 text-left">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {mode === "practice" ? "Question" : "Front"}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-lg font-semibold leading-snug">
            {card.front}
          </p>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Answer
          </p>
          <p className="study-reveal-back mt-4 whitespace-pre-wrap text-3xl font-semibold leading-tight">
            {card.back}
          </p>
          {(card.pronunciation || card.exampleSentence || card.notes) && (
            <div className="mt-6 space-y-1 border-t pt-4 text-sm text-muted-foreground">
              {card.pronunciation && <p>{card.pronunciation}</p>}
              {card.exampleSentence && <p>{card.exampleSentence}</p>}
              {card.notes && <p>{card.notes}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!current) return null;

  const headerSubtitle =
    subtitle ??
    (isSwipeNavigation ? progress : mode === "practice" ? "Practice mode" : progress);

  const dragRotation = Math.max(-14, Math.min(14, dragX * 0.04));
  const dragOpacity = Math.max(0.72, 1 - Math.abs(dragX) / 900);
  const showSwipeTransition = !isDragging;

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
        className="relative flex flex-1 flex-col overflow-hidden px-4 pb-4"
        style={!isSwipeNavigation && mode === "practice" ? { touchAction: "pan-y" } : undefined}
      >
        {isSwipeNavigation ? (
          <div className="relative flex flex-1 items-stretch py-2">
            {cards.length > 1 && (
              <>
                {dragX > 12 && previousCard && previousIndex !== currentIndex && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-4 bottom-4 rounded-3xl border bg-card/90 shadow-md"
                    style={{
                      transform: `scale(${0.94 + Math.min(dragX / 800, 0.04)})`,
                      opacity: Math.min(dragX / 120, 0.85),
                    }}
                  >
                    <div className="flex h-full items-center justify-center px-6 text-center opacity-60">
                      <p className="line-clamp-4 text-lg font-semibold">{previousCard.front}</p>
                    </div>
                  </div>
                )}
                {dragX < -12 && nextCard && nextIndex !== currentIndex && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-6 top-4 bottom-4 rounded-3xl border bg-card/90 shadow-md"
                    style={{
                      transform: `scale(${0.94 + Math.min(Math.abs(dragX) / 800, 0.04)})`,
                      opacity: Math.min(Math.abs(dragX) / 120, 0.85),
                    }}
                  >
                    <div className="flex h-full items-center justify-center px-6 text-center opacity-60">
                      <p className="line-clamp-4 text-lg font-semibold">{nextCard.front}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div
              key={current.id}
              className={cn(
                "relative z-10 flex min-h-0 flex-1 touch-none select-none flex-col overflow-hidden rounded-3xl border bg-card shadow-xl",
                !isDragging && !isExiting && "study-card-enter",
              )}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragRotation}deg)`,
                opacity: dragOpacity,
                transition: showSwipeTransition
                  ? `transform ${SWIPE_EXIT_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${SWIPE_EXIT_MS}ms ease-out`
                  : "none",
              }}
              onPointerDown={handleSwipePointerDown}
              onPointerMove={handleSwipePointerMove}
              onPointerUp={handleSwipePointerUp}
              onPointerCancel={handleSwipePointerCancel}
            >
              {renderCardBody(current, isRevealed)}
            </div>
          </div>
        ) : !isRevealed ? (
          <button
            type="button"
            onClick={revealCurrent}
            className="study-card-enter flex flex-1 flex-col items-center justify-center px-6 text-center"
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
          <div className="study-card-enter flex flex-1 flex-col gap-4 overflow-auto px-2 py-4">
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
          Drag left for next · drag right for previous · loops endlessly · tap center to reveal
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
