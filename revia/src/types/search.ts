export type SearchResultType = "deck" | "lesson" | "card";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  href: string;
  deckId: string;
  deckTitle: string;
  lessonTitle: string | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}
