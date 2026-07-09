import { DeckDetailContent } from "@/features/decks/components/deck-detail-content";

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function DeckDetailPage({ params, searchParams }: DeckDetailPageProps) {
  const { deckId } = await params;
  const { mode } = await searchParams;
  return <DeckDetailContent deckId={deckId} reverseMode={mode === "reverse"} />;
}
