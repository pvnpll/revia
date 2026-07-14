export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  isArchived: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithStats extends Deck {
  cardCount: number;
  dueCount: number;
}

export interface DeckDetail extends Deck {
  isOwner: boolean;
}

export interface PublicDeckSummary {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  cardCount: number;
  authorName: string | null;
  updatedAt: string;
}
