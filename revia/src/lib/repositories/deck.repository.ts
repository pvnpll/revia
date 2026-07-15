import { randomUUID } from "crypto";

import type { Deck as PrismaDeck, Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { schedulingEngine } from "@/lib/scheduler";
import type { Deck, DeckWithStats, PublicDeckSummary } from "@/types/deck";

function toDeck(row: PrismaDeck): Deck {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    subject: row.subject,
    color: row.color ?? "#6366f1",
    isArchived: row.isArchived,
    isPublic: row.isPublic,
    sourceDeckId: row.sourceDeckId,
    sourceAuthorUsername: row.sourceAuthorUsername,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const deckRepository = {
  async findById(id: string): Promise<Deck | null> {
    const row = await prisma.deck.findUnique({ where: { id } });
    return row ? toDeck(row) : null;
  },

  async findByIdForUser(id: string, userId: string): Promise<Deck | null> {
    const row = await prisma.deck.findFirst({ where: { id, userId } });
    return row ? toDeck(row) : null;
  },

  async findByUser(userId: string): Promise<DeckWithStats[]> {
    const now = new Date();

    const [rows, dueCounts] = await Promise.all([
      prisma.deck.findMany({
        where: { userId, isArchived: false },
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { cards: { where: { isSuspended: false } } } },
        },
      }),
      prisma.card.groupBy({
        by: ["deckId"],
        where: {
          isSuspended: false,
          deck: { userId, isArchived: false },
          schedulingState: { dueAt: { lte: now } },
        },
        _count: { _all: true },
      }),
    ]);

    const dueByDeck = new Map(dueCounts.map((row) => [row.deckId, row._count._all]));

    return rows.map((row) => ({
      ...toDeck(row),
      cardCount: row._count.cards,
      dueCount: dueByDeck.get(row.id) ?? 0,
    }));
  },

  async findRecentByUser(userId: string, limit: number): Promise<DeckWithStats[]> {
    const now = new Date();

    const [rows, dueCounts] = await Promise.all([
      prisma.deck.findMany({
        where: { userId, isArchived: false },
        orderBy: { updatedAt: "desc" },
        take: limit,
        include: {
          _count: { select: { cards: { where: { isSuspended: false } } } },
        },
      }),
      prisma.card.groupBy({
        by: ["deckId"],
        where: {
          isSuspended: false,
          deck: { userId, isArchived: false },
          schedulingState: { dueAt: { lte: now } },
        },
        _count: { _all: true },
      }),
    ]);

    const dueByDeck = new Map(dueCounts.map((row) => [row.deckId, row._count._all]));

    return rows.map((row) => ({
      ...toDeck(row),
      cardCount: row._count.cards,
      dueCount: dueByDeck.get(row.id) ?? 0,
    }));
  },

  async recordAccess(deckId: string, userId: string): Promise<void> {
    await prisma.deck.updateMany({
      where: { id: deckId, userId, isArchived: false },
      data: { updatedAt: new Date() },
    });
  },

  async findPublicById(id: string): Promise<(Deck & { authorUsername: string }) | null> {
    const row = await prisma.deck.findFirst({
      where: { id, isPublic: true, isArchived: false, sourceDeckId: null },
      include: { user: { select: { username: true } } },
    });
    if (!row) return null;
    return {
      ...toDeck(row),
      authorUsername: row.user.username ?? "learner",
    };
  },

  async findPublicDecks(input: {
    query: string;
    limit: number;
  }): Promise<PublicDeckSummary[]> {
    const normalized = input.query.trim();
    const rows = await prisma.deck.findMany({
      where: {
        isPublic: true,
        isArchived: false,
        sourceDeckId: null,
        ...(normalized
          ? {
              OR: [
                { title: { contains: normalized, mode: "insensitive" } },
                { description: { contains: normalized, mode: "insensitive" } },
                { subject: { contains: normalized, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: input.limit,
      include: {
        user: { select: { username: true } },
        _count: { select: { cards: { where: { isSuspended: false } } } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      subject: row.subject,
      color: row.color ?? "#6366f1",
      cardCount: row._count.cards,
      authorUsername: row.user.username ?? "learner",
      updatedAt: row.updatedAt.toISOString(),
    }));
  },

  async create(
    userId: string,
    input: { title: string; description?: string | null; subject?: string | null; color?: string },
  ): Promise<Deck> {
    const row = await prisma.deck.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        subject: input.subject ?? null,
        color: input.color ?? "#6366f1",
      },
    });
    return toDeck(row);
  },

  async update(
    id: string,
    input: Partial<{
      title: string;
      description: string | null;
      subject: string | null;
      color: string;
      isPublic: boolean;
    }>,
  ): Promise<Deck> {
    const row = await prisma.deck.update({ where: { id }, data: input });
    return toDeck(row);
  },

  async findImportedCopy(userId: string, sourceDeckId: string): Promise<Deck | null> {
    const row = await prisma.deck.findFirst({
      where: { userId, sourceDeckId, isArchived: false },
    });
    return row ? toDeck(row) : null;
  },

  async clonePublicDeckToUser(userId: string, sourceDeckId: string): Promise<Deck> {
    const source = await prisma.deck.findFirst({
      where: { id: sourceDeckId, isPublic: true, isArchived: false },
      include: {
        user: { select: { username: true } },
        lessons: {
          orderBy: { sortOrder: "asc" },
          include: {
            cards: {
              where: { isSuspended: false },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        cards: {
          where: { isSuspended: false, lessonId: null },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!source) {
      throw new Error("SOURCE_NOT_PUBLIC");
    }

    if (source.userId === userId) {
      throw new Error("OWN_DECK");
    }

    const existing = await deckRepository.findImportedCopy(userId, sourceDeckId);
    if (existing) {
      return existing;
    }

    const authorUsername = source.user.username ?? "learner";

    return prisma.$transaction(async (tx) => {
      const deck = await tx.deck.create({
        data: {
          userId,
          title: source.title,
          description: source.description,
          subject: source.subject,
          color: source.color ?? "#6366f1",
          isPublic: false,
          sourceDeckId,
          sourceAuthorUsername: authorUsername,
        },
      });

      const lessonIdMap = new Map<string, string>();

      for (const lesson of source.lessons) {
        const newLesson = await tx.lesson.create({
          data: {
            deckId: deck.id,
            title: lesson.title,
            sortOrder: lesson.sortOrder,
          },
        });
        lessonIdMap.set(lesson.id, newLesson.id);

        for (const card of lesson.cards) {
          const cardId = randomUUID();
          const initialState = schedulingEngine.createInitialState(cardId, new Date());
          await tx.card.create({
            data: {
              id: cardId,
              deckId: deck.id,
              lessonId: newLesson.id,
              front: card.front,
              back: card.back,
              pronunciation: card.pronunciation,
              exampleSentence: card.exampleSentence,
              notes: card.notes,
              imageUrl: card.imageUrl,
              audioUrl: card.audioUrl,
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
        }
      }

      for (const card of source.cards) {
        const cardId = randomUUID();
        const initialState = schedulingEngine.createInitialState(cardId, new Date());
        await tx.card.create({
          data: {
            id: cardId,
            deckId: deck.id,
            front: card.front,
            back: card.back,
            pronunciation: card.pronunciation,
            exampleSentence: card.exampleSentence,
            notes: card.notes,
            imageUrl: card.imageUrl,
            audioUrl: card.audioUrl,
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
      }

      return toDeck(deck);
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.deck.delete({ where: { id } });
  },
};
