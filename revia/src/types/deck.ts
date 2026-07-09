export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  subject: string | null;
  color: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeckWithStats extends Deck {
  cardCount: number;
  dueCount: number;
}
