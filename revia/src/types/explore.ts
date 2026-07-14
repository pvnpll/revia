import type { PublicDeckSummary } from "@/types/deck";

export interface ExploreResponse {
  query: string;
  decks: PublicDeckSummary[];
}
