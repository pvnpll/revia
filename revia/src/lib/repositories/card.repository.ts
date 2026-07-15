import { Prisma, type Card as PrismaCard, type CardSchedulingState as PrismaCardSchedulingState } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { Card, CardWithScheduling } from "@/types/card";
import type { CardSchedulingState as SchedulerState } from "@/lib/scheduler";

type CardRow = PrismaCard & {
  lesson: { id: string; title: string } | null;
  schedulingState: PrismaCardSchedulingState | null;
};

function toCard(row: PrismaCard): Card {
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
  };
}

function toCardWithScheduling(row: CardRow): CardWithScheduling {
  return {
    ...toCard(row),
    lesson: row.lesson,
    schedulingState: row.schedulingState
      ? {
          dueAt: row.schedulingState.dueAt.toISOString(),
          intervalDays: row.schedulingState.intervalDays,
          easeFactor: row.schedulingState.easeFactor,
          repetitions: row.schedulingState.repetitions,
          lapses: row.schedulingState.lapses,
          lastReviewedAt: row.schedulingState.lastReviewedAt?.toISOString() ?? null,
          algorithmVersion: row.schedulingState.algorithmVersion,
        }
      : null,
  };
}

const cardInclude = Prisma.validator<Prisma.CardInclude>()({
  lesson: { select: { id: true, title: true } },
  schedulingState: true,
});

const practiceCardInclude = Prisma.validator<Prisma.CardInclude>()({
  lesson: { select: { id: true, title: true } },
});

type PracticeCardRow = PrismaCard & {
  lesson: { id: string; title: string } | null;
};

function toPracticeCard(row: PracticeCardRow): CardWithScheduling {
  return {
    ...toCard(row),
    lesson: row.lesson,
    schedulingState: null,
  };
}

export const cardRepository = {
  async findByDeck(deckId: string, lessonId?: string): Promise<CardWithScheduling[]> {
    const rows = await prisma.card.findMany({
      where: {
        deckId,
        ...(lessonId ? { lessonId, isSuspended: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: cardInclude,
    });

    return rows.map(toCardWithScheduling);
  },

  async findForPractice(
    deckId: string,
    options?: { lessonId?: string },
  ): Promise<CardWithScheduling[]> {
    const rows = await prisma.card.findMany({
      where: {
        deckId,
        isSuspended: false,
        ...(options?.lessonId ? { lessonId: options.lessonId } : {}),
      },
      orderBy: { createdAt: "asc" },
      include: practiceCardInclude,
    });

    return rows.map((row) => toPracticeCard(row as PracticeCardRow));
  },

  async findForPracticeByDeckIds(
    deckIds: string[],
    options?: { limit?: number },
  ): Promise<CardWithScheduling[]> {
    if (deckIds.length === 0) {
      return [];
    }

    const limit = options?.limit;
    if (!limit) {
      const rows = await prisma.card.findMany({
        where: {
          deckId: { in: deckIds },
          isSuspended: false,
        },
        orderBy: [{ deckId: "asc" }, { createdAt: "asc" }],
        include: practiceCardInclude,
      });
      return rows.map((row) => toPracticeCard(row as PracticeCardRow));
    }

    const cards: CardWithScheduling[] = [];
    for (const deckId of deckIds) {
      if (cards.length >= limit) {
        break;
      }
      const rows = await prisma.card.findMany({
        where: { deckId, isSuspended: false },
        orderBy: { createdAt: "asc" },
        take: limit - cards.length,
        include: practiceCardInclude,
      });
      cards.push(...rows.map((row) => toPracticeCard(row as PracticeCardRow)));
    }
    return cards;
  },

  async findByIdForDeck(id: string, deckId: string): Promise<CardWithScheduling | null> {
    const row = await prisma.card.findFirst({
      where: { id, deckId },
      include: cardInclude,
    });
    return row ? toCardWithScheduling(row) : null;
  },

  async create(
    input: {
      id: string;
      deckId: string;
      lessonId?: string | null;
      front: string;
      back: string;
      pronunciation?: string | null;
      exampleSentence?: string | null;
      notes?: string | null;
      imageUrl?: string | null;
      audioUrl?: string | null;
    },
    initialState: SchedulerState,
  ): Promise<CardWithScheduling> {
    const row = await prisma.card.create({
      data: {
        id: input.id,
        deckId: input.deckId,
        lessonId: input.lessonId ?? null,
        front: input.front,
        back: input.back,
        pronunciation: input.pronunciation ?? null,
        exampleSentence: input.exampleSentence ?? null,
        notes: input.notes ?? null,
        imageUrl: input.imageUrl ?? null,
        audioUrl: input.audioUrl ?? null,
        schedulingState: {
          create: {
            dueAt: initialState.dueAt,
            intervalDays: initialState.intervalDays,
            easeFactor: initialState.easeFactor,
            repetitions: initialState.repetitions,
            lapses: initialState.lapses,
            lastReviewedAt: initialState.lastReviewedAt,
            algorithmVersion: initialState.algorithmVersion,
            algorithmState:
              initialState.algorithmState === null
                ? undefined
                : (initialState.algorithmState as Prisma.InputJsonObject),
          },
        },
      },
      include: cardInclude,
    });

    return toCardWithScheduling(row);
  },

  async update(
    id: string,
    input: Partial<{
      lessonId: string | null;
      front: string;
      back: string;
      pronunciation: string | null;
      exampleSentence: string | null;
      notes: string | null;
      imageUrl: string | null;
      audioUrl: string | null;
      isSuspended: boolean;
    }>,
  ): Promise<CardWithScheduling> {
    const row = await prisma.card.update({
      where: { id },
      data: input,
      include: cardInclude,
    });
    return toCardWithScheduling(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.card.delete({ where: { id } });
  },
};
