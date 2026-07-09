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

export const cardRepository = {
  async findByDeck(deckId: string): Promise<CardWithScheduling[]> {
    const rows = await prisma.card.findMany({
      where: { deckId },
      orderBy: { createdAt: "desc" },
      include: cardInclude,
    });

    return rows.map(toCardWithScheduling);
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
