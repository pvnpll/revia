import { Prisma, type Card, type CardSchedulingState } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { CardSchedulingState as SchedulerState, ScheduleResult } from "@/lib/scheduler";
import type { DueReviewCard, ReviewQueue, SubmitReviewResult } from "@/types/review";

type DueCardRow = Card & {
  lesson: { id: string; title: string } | null;
  schedulingState: CardSchedulingState | null;
};

function toSchedulerState(row: CardSchedulingState): SchedulerState {
  return {
    cardId: row.cardId,
    dueAt: row.dueAt,
    intervalDays: row.intervalDays,
    easeFactor: row.easeFactor,
    repetitions: row.repetitions,
    lapses: row.lapses,
    lastReviewedAt: row.lastReviewedAt,
    algorithmVersion: row.algorithmVersion,
    algorithmState: row.algorithmState as Record<string, unknown> | null,
  };
}

function toDueReviewCard(row: DueCardRow): DueReviewCard {
  if (!row.schedulingState) {
    throw new Error(`Card ${row.id} is missing scheduling state`);
  }

  return {
    id: row.id,
    deckId: row.deckId,
    lessonId: row.lessonId,
    front: row.front,
    back: row.back,
    pronunciation: row.pronunciation,
    exampleSentence: row.exampleSentence,
    notes: row.notes,
    imageUrl: row.imageUrl,
    audioUrl: row.audioUrl,
    isSuspended: row.isSuspended,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lesson: row.lesson,
    dueAt: row.schedulingState.dueAt.toISOString(),
    schedulingState: {
      dueAt: row.schedulingState.dueAt.toISOString(),
      intervalDays: row.schedulingState.intervalDays,
      easeFactor: row.schedulingState.easeFactor,
      repetitions: row.schedulingState.repetitions,
      lapses: row.schedulingState.lapses,
      lastReviewedAt: row.schedulingState.lastReviewedAt?.toISOString() ?? null,
      algorithmVersion: row.schedulingState.algorithmVersion,
    },
  };
}

export const reviewRepository = {
  async findDueCards(input: {
    userId: string;
    deckId?: string;
    limit: number;
    now: Date;
  }): Promise<ReviewQueue> {
    const where: Prisma.CardWhereInput = {
      isSuspended: false,
      deck: {
        userId: input.userId,
        isArchived: false,
        ...(input.deckId ? { id: input.deckId } : {}),
      },
      schedulingState: {
        dueAt: { lte: input.now },
      },
    };

    const [totalDue, rows] = await Promise.all([
      prisma.card.count({ where }),
      prisma.card.findMany({
        where,
        orderBy: { schedulingState: { dueAt: "asc" } },
        take: input.limit,
        include: {
          lesson: { select: { id: true, title: true } },
          schedulingState: true,
        },
      }),
    ]);

    return { totalDue, cards: rows.map(toDueReviewCard) };
  },

  async submitReview(input: {
    userId: string;
    cardId: string;
    rating: 1 | 2 | 3 | 4 | 5;
    durationMs?: number;
    now: Date;
    calculateNext: (state: SchedulerState) => ScheduleResult;
  }): Promise<SubmitReviewResult | null> {
    return prisma.$transaction(async (tx) => {
      const card = await tx.card.findFirst({
        where: {
          id: input.cardId,
          isSuspended: false,
          deck: { userId: input.userId, isArchived: false },
        },
        include: { schedulingState: true },
      });

      if (!card?.schedulingState) return null;

      const stateBefore = toSchedulerState(card.schedulingState);
      const next = input.calculateNext(stateBefore);

      await tx.cardSchedulingState.update({
        where: { cardId: input.cardId },
        data: {
          dueAt: next.dueAt,
          intervalDays: next.intervalDays,
          easeFactor: next.easeFactor,
          repetitions: next.repetitions,
          lapses: next.lapses,
          lastReviewedAt: input.now,
          algorithmVersion: next.algorithmVersion,
          algorithmState:
            next.algorithmState === null ? undefined : (next.algorithmState as Prisma.InputJsonObject),
        },
      });

      await tx.reviewLog.create({
        data: {
          cardId: input.cardId,
          userId: input.userId,
          rating: input.rating,
          intervalBefore: stateBefore.intervalDays,
          intervalAfter: next.intervalDays,
          easeBefore: stateBefore.easeFactor,
          easeAfter: next.easeFactor,
          reviewedAt: input.now,
          durationMs: input.durationMs,
          algorithmVersion: next.algorithmVersion,
        },
      });

      return {
        cardId: input.cardId,
        rating: input.rating,
        reviewedAt: input.now.toISOString(),
        nextDueAt: next.dueAt.toISOString(),
        intervalBefore: stateBefore.intervalDays,
        intervalAfter: next.intervalDays,
        easeBefore: stateBefore.easeFactor,
        easeAfter: next.easeFactor,
        repetitions: next.repetitions,
        lapses: next.lapses,
      };
    });
  },
};
