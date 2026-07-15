"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Compass, FileQuestion, Globe, Layers, Search } from "lucide-react";

import { useExplore } from "@/features/explore/hooks/use-explore";
import { useSearch } from "@/features/search/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { PublicDeckSummary } from "@/types/deck";
import type { SearchResult, SearchResultType } from "@/types/search";

const resultLabels: Record<SearchResultType, string> = {
  deck: "Deck",
  lesson: "Lesson",
  card: "Card",
};

const resultIcons: Record<SearchResultType, React.ComponentType<{ className?: string }>> = {
  deck: BookOpen,
  lesson: Layers,
  card: FileQuestion,
};

function groupResults(results: SearchResult[]) {
  return results.reduce<Record<SearchResultType, SearchResult[]>>(
    (groups, result) => {
      groups[result.type].push(result);
      return groups;
    },
    { deck: [], lesson: [], card: [] },
  );
}

export function ExplorePageContent() {
  const [libraryQuery, setLibraryQuery] = useState("");
  const [publicQuery, setPublicQuery] = useState("");

  const librarySearch = useSearch(libraryQuery);
  const publicExplore = useExplore(publicQuery);

  const normalizedLibrary = libraryQuery.trim();
  const normalizedPublic = publicQuery.trim();
  const libraryResults = useMemo(
    () => librarySearch.data?.results ?? [],
    [librarySearch.data?.results],
  );
  const grouped = useMemo(() => groupResults(libraryResults), [libraryResults]);
  const publicDecks = publicExplore.data?.decks ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Compass className="h-6 w-6 text-primary" />
          Explore
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search your library and discover public decks from the community.
        </p>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Search your library</h2>
          <p className="text-sm text-muted-foreground">
            Find decks, lessons, and cards you own.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={libraryQuery}
            onChange={(event) => setLibraryQuery(event.target.value)}
            placeholder="Search cards, lessons, decks..."
            className="h-12 rounded-2xl pl-10 text-base"
            autoFocus
          />
        </div>

        {normalizedLibrary.length < 2 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Type at least two characters to search your learning content.
            </CardContent>
          </Card>
        )}

        {librarySearch.isError && (
          <p className="text-sm text-destructive">
            {librarySearch.error instanceof Error
              ? librarySearch.error.message
              : "Search failed"}
          </p>
        )}

        {normalizedLibrary.length >= 2 && !librarySearch.isError && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {librarySearch.isFetching
                  ? "Searching..."
                  : `${libraryResults.length} result${libraryResults.length === 1 ? "" : "s"}`}
              </p>
              {librarySearch.data?.query && (
                <Badge variant="secondary">{librarySearch.data.query}</Badge>
              )}
            </div>

            {!librarySearch.isFetching && libraryResults.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No results found. Try another word from a deck, lesson, or card.
                </CardContent>
              </Card>
            ) : (
              (Object.keys(grouped) as SearchResultType[]).map((type) =>
                grouped[type].length > 0 ? (
                  <SearchGroup key={type} type={type} results={grouped[type]} />
                ) : null,
              )
            )}
          </div>
        )}
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Globe className="h-5 w-5 text-primary" />
            Public decks
          </h2>
          <p className="text-sm text-muted-foreground">
            Decks published to Explore — including your own when marked public.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            value={publicQuery}
            onChange={(event) => setPublicQuery(event.target.value)}
            placeholder="Filter public decks by title, subject..."
            className="h-12 rounded-2xl pl-10 text-base"
          />
        </div>

        {publicExplore.isError && (
          <p className="text-sm text-destructive">
            {publicExplore.error instanceof Error
              ? publicExplore.error.message
              : "Failed to load public decks"}
          </p>
        )}

        {publicExplore.isFetching ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              Loading public decks...
            </CardContent>
          </Card>
        ) : publicDecks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              {normalizedPublic
                ? "No public decks match your search yet."
                : "No public decks to show yet. Be the first to publish one."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {publicDecks.map((deck) => (
              <PublicDeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SearchGroup({ type, results }: { type: SearchResultType; results: SearchResult[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{resultLabels[type]}s</CardTitle>
        <CardDescription>
          {results.length} matching item{results.length === 1 ? "" : "s"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {results.map((result) => (
            <SearchResultItem key={`${result.type}-${result.id}`} result={result} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function SearchResultItem({ result }: { result: SearchResult }) {
  const Icon = resultIcons[result.type];

  return (
    <li>
      <Link href={result.href} className="flex gap-3 py-3">
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{result.title}</p>
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {resultLabels[result.type]}
            </Badge>
          </div>
          {result.subtitle && (
            <p className="mt-1 text-xs text-muted-foreground">{result.subtitle}</p>
          )}
          {result.snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.snippet}</p>
          )}
        </div>
      </Link>
    </li>
  );
}

function PublicDeckCard({ deck }: { deck: PublicDeckSummary }) {
  return (
    <Card className="transition-colors hover:bg-accent/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: deck.color }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <CardTitle className="text-lg">
                <Link href={`/decks/${deck.id}`} prefetch className="hover:underline">
                  {deck.title}
                </Link>
              </CardTitle>
              <span className="text-sm text-muted-foreground">@{deck.authorUsername}</span>
            </div>
            {deck.subject && <CardDescription>{deck.subject}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {deck.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{deck.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{deck.cardCount} cards</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
