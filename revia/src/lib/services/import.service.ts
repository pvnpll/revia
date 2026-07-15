import { randomUUID } from "crypto";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { schedulingEngine } from "@/lib/scheduler";
import type { ImportDeckRequest } from "@/lib/validators/import.schema";
import { ApiError } from "@/types/api";

export interface ImportDeckResult {
  deckId: string;
  deckTitle: string;
  lessonCount: number;
  cardCount: number;
  tagCount: number;
}

const LESSON_IMPORT_TIMEOUT_MS = 30_000;

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function uniqueTags(tags: readonly string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

async function upsertTags(
  tx: Prisma.TransactionClient,
  userId: string,
  tags: readonly string[],
): Promise<Map<string, string>> {
  const tagMap = new Map<string, string>();

  for (const tag of uniqueTags(tags)) {
    const row = await tx.tag.upsert({
      where: { userId_name: { userId, name: tag } },
      create: { userId, name: tag },
      update: {},
    });
    tagMap.set(tag, row.id);
  }

  return tagMap;
}

async function createImportedCard(
  tx: Prisma.TransactionClient,
  deckId: string,
  lessonId: string,
  cardInput: ImportDeckRequest["lessons"][number]["cards"][number],
  tagMap: Map<string, string>,
): Promise<void> {
  const cardId = randomUUID();
  const initialState = schedulingEngine.createInitialState(cardId, new Date());
  const card = await tx.card.create({
    data: {
      id: cardId,
      deckId,
      lessonId,
      front: cardInput.front,
      back: cardInput.back,
      pronunciation: normalizeOptionalText(cardInput.pronunciation),
      exampleSentence: normalizeOptionalText(cardInput.exampleSentence ?? cardInput.example),
      notes: normalizeOptionalText(cardInput.notes),
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
  });

  for (const tag of cardInput.tags) {
    const tagId = tagMap.get(tag);
    if (tagId) {
      await tx.cardTag.create({ data: { cardId: card.id, tagId } });
    }
  }
}

export const importService = {
  async importDeck(userId: string, input: ImportDeckRequest): Promise<ImportDeckResult> {
    const allTags = [
      ...input.deck.tags,
      ...input.lessons.flatMap((lesson) => lesson.cards.flatMap((card) => card.tags)),
    ];

    const { deck, tagMap, sortOrderOffset } = await prisma.$transaction(async (tx) => {
      const tagMap = await upsertTags(tx, userId, allTags);

      const deck = input.targetDeckId
        ? await tx.deck.findFirst({
            where: { id: input.targetDeckId, userId, isArchived: false },
          })
        : await tx.deck.create({
            data: {
              userId,
              title: input.deck.title,
              description: normalizeOptionalText(input.deck.description),
              subject: null,
            },
          });

      if (!deck) {
        throw new ApiError(404, "NOT_FOUND", "Target deck not found");
      }

      if (!input.targetDeckId) {
        for (const tag of input.deck.tags) {
          const tagId = tagMap.get(tag);
          if (tagId) {
            await tx.deckTag.create({ data: { deckId: deck.id, tagId } });
          }
        }
      }

      const sortOrderOffset = input.targetDeckId
        ? ((await tx.lesson.aggregate({
            where: { deckId: deck.id },
            _max: { sortOrder: true },
          }))._max.sortOrder ?? -1) + 1
        : 0;

      return { deck, tagMap, sortOrderOffset };
    });

    let cardCount = 0;

    for (const [lessonIndex, lessonInput] of input.lessons.entries()) {
      const lessonCardCount = await prisma.$transaction(
        async (tx) => {
          const lesson = await tx.lesson.create({
            data: {
              deckId: deck.id,
              title: lessonInput.title,
              sortOrder: sortOrderOffset + lessonIndex,
            },
          });

          for (const cardInput of lessonInput.cards) {
            await createImportedCard(tx, deck.id, lesson.id, cardInput, tagMap);
          }

          return lessonInput.cards.length;
        },
        { timeout: LESSON_IMPORT_TIMEOUT_MS },
      );

      cardCount += lessonCardCount;
    }

    return {
      deckId: deck.id,
      deckTitle: deck.title,
      lessonCount: input.lessons.length,
      cardCount,
      tagCount: tagMap.size,
    };
  },
};
