import type { Deck as PrismaDeck } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { Deck, DeckWithStats } from "@/types/deck";

function toDeck(row: PrismaDeck): Deck {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    description: row.description,
    subject: row.subject,
    color: row.color ?? "#6366f1",
    isArchived: row.isArchived,
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
    input: Partial<{ title: string; description: string | null; subject: string | null; color: string }>,
  ): Promise<Deck> {
    const row = await prisma.deck.update({ where: { id }, data: input });
    return toDeck(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.deck.delete({ where: { id } });
  },
};
