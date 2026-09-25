import { prisma } from "@/lib/db/prisma";
import type { SearchResponse, SearchResult } from "@/types/search";

function truncate(value: string | null | undefined, maxLength = 140): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}...` : trimmed;
}

export const searchRepository = {
  async search(input: {
    userId: string;
    query: string;
    limit: number;
  }): Promise<SearchResponse> {
    const query = input.query.trim();
    if (query.length < 2) return { query, results: [] };

    const perTypeLimit = Math.max(3, Math.ceil(input.limit / 3));
    const contains = { contains: query, mode: "insensitive" as const };

    const [decks, lessons, cards] = await Promise.all([
      prisma.deck.findMany({
        where: {
          userId: input.userId,
          isArchived: false,
          OR: [{ title: contains }, { description: contains }, { subject: contains }],
        },
        orderBy: { updatedAt: "desc" },
        take: perTypeLimit,
      }),
      prisma.lesson.findMany({
        where: {
          deck: { userId: input.userId, isArchived: false },
          title: contains,
        },
        include: { deck: { select: { id: true, title: true } } },
        orderBy: { updatedAt: "desc" },
        take: perTypeLimit,
      }),
      prisma.card.findMany({
        where: {
          isSuspended: false,
          deck: { userId: input.userId, isArchived: false },
          OR: [
            { front: contains },
            { back: contains },
            { pronunciation: contains },
            { exampleSentence: contains },
            { notes: contains },
          ],
        },
        include: {
          deck: { select: { id: true, title: true } },
          lesson: { select: { title: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: perTypeLimit,
      }),
    ]);

    const results: SearchResult[] = [
      ...decks.map((deck): SearchResult => ({
        id: deck.id,
        type: "deck",
        title: deck.title,
        subtitle: deck.subject,
        snippet: truncate(deck.description),
        href: `/decks/${deck.id}`,
        deckId: deck.id,
        deckTitle: deck.title,
        lessonTitle: null,
      })),
      ...lessons.map((lesson): SearchResult => ({
        id: lesson.id,
        type: "lesson",
        title: lesson.title,
        subtitle: `Deck: ${lesson.deck.title}`,
        snippet: null,
        href: `/decks/${lesson.deck.id}`,
        deckId: lesson.deck.id,
        deckTitle: lesson.deck.title,
        lessonTitle: lesson.title,
      })),
      ...cards.map((card): SearchResult => ({
        id: card.id,
        type: "card",
        title: card.front,
        subtitle: card.lesson?.title ? `Lesson: ${card.lesson.title}` : `Deck: ${card.deck.title}`,
        snippet: truncate(card.back ?? card.exampleSentence ?? card.notes),
        href: `/decks/${card.deck.id}`,
        deckId: card.deck.id,
        deckTitle: card.deck.title,
        lessonTitle: card.lesson?.title ?? null,
      })),
    ];

    return { query, results: results.slice(0, input.limit) };
  },
};
