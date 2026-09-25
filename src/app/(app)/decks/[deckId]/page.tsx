import { DeckDetailContent } from "@/features/decks/components/deck-detail-content";

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { deckId } = await params;
  return <DeckDetailContent deckId={deckId} />;
}
