import { GeneratedCard } from "@/lib/validators/ai";

/**
 * Normalizes text for comparison by lowercasing, stripping punctuation,
 * and collapsing whitespace.
 */
export function normalizeCardText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DedupFilterOptions {
  known?: string[];
  recentlySeen?: string[];
}

export interface DedupFilterResult {
  cards: GeneratedCard[];
  duplicatesRemoved: number;
}

/**
 * Programmatic deduplication checking:
 * 1. Checks card front/back against learner's known concepts
 * 2. Checks card front/back against learner's recently seen concepts
 * 3. Checks for internal duplicates within the generated batch itself
 */
export function filterDuplicateCards(
  cards: GeneratedCard[],
  options: DedupFilterOptions = {},
): DedupFilterResult {
  const existingSet = new Set<string>();

  const seedTerms = [...(options.known || []), ...(options.recentlySeen || [])];
  for (const term of seedTerms) {
    const normalized = normalizeCardText(term);
    if (normalized) {
      existingSet.add(normalized);
    }
  }

  const seenInBatch = new Set<string>();
  const uniqueCards: GeneratedCard[] = [];
  let duplicatesRemoved = 0;

  for (const card of cards) {
    const normFront = normalizeCardText(card.front);
    const normBack = normalizeCardText(card.back);

    // Check if matches known/recentlySeen or already present in current batch
    const isDuplicate =
      (normFront && existingSet.has(normFront)) ||
      (normBack && existingSet.has(normBack)) ||
      (normFront && seenInBatch.has(normFront));

    if (isDuplicate) {
      duplicatesRemoved++;
    } else {
      uniqueCards.push(card);
      if (normFront) seenInBatch.add(normFront);
    }
  }

  return {
    cards: uniqueCards,
    duplicatesRemoved,
  };
}
