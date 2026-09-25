import type { Lesson as PrismaLesson } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { Lesson, LessonWithStats } from "@/types/lesson";

function toLesson(row: PrismaLesson): Lesson {
  return {
    id: row.id,
    deckId: row.deckId,
    title: row.title,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const lessonRepository = {
  async findByDeck(deckId: string): Promise<LessonWithStats[]> {
    const rows = await prisma.lesson.findMany({
      where: { deckId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { cards: { where: { isSuspended: false } } } },
      },
    });

    return rows.map((row) => ({
      ...toLesson(row),
      cardCount: row._count.cards,
    }));
  },

  async findById(id: string): Promise<Lesson | null> {
    const row = await prisma.lesson.findUnique({ where: { id } });
    return row ? toLesson(row) : null;
  },

  async findByIdForDeck(id: string, deckId: string): Promise<Lesson | null> {
    const row = await prisma.lesson.findFirst({ where: { id, deckId } });
    return row ? toLesson(row) : null;
  },

  async getNextSortOrder(deckId: string): Promise<number> {
    const result = await prisma.lesson.aggregate({
      where: { deckId },
      _max: { sortOrder: true },
    });
    return (result._max.sortOrder ?? -1) + 1;
  },

  async create(
    deckId: string,
    input: { title: string; sortOrder?: number },
  ): Promise<Lesson> {
    const sortOrder = input.sortOrder ?? (await lessonRepository.getNextSortOrder(deckId));
    const row = await prisma.lesson.create({
      data: { deckId, title: input.title, sortOrder },
    });
    return toLesson(row);
  },

  async update(
    id: string,
    input: Partial<{ title: string; sortOrder: number }>,
  ): Promise<Lesson> {
    const row = await prisma.lesson.update({ where: { id }, data: input });
    return toLesson(row);
  },

  async delete(id: string): Promise<void> {
    await prisma.lesson.delete({ where: { id } });
  },
};
