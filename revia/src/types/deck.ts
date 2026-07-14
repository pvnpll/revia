export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  isArchived: boolean;
  isPublic: boolean;
  sourceDeckId: string | null;
  sourceAuthorUsername: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithStats extends Deck {
  cardCount: number;
  dueCount: number;
}

export interface DeckDetail extends Deck {
  isOwner: boolean;
  importedDeckId?: string | null;
  authorUsername?: string | null;
}

export interface PublicDeckSummary {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  cardCount: number;
  authorUsername: string;
  updatedAt: string;
}
