"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, FileQuestion, Layers, Search } from "lucide-react";

import { useSearch } from "@/features/search/hooks/use-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function SearchPageContent() {
  const [query, setQuery] = useState("");
  const { data, isFetching, isError, error } = useSearch(query);
  const normalized = query.trim();
  const results = useMemo(() => data?.results ?? [], [data?.results]);
  const grouped = useMemo(() => groupResults(results), [results]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find decks, lessons, and cards across your Revia library.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cards, lessons, decks..."
          className="h-12 rounded-2xl pl-10 text-base"
          autoFocus
        />
      </div>

      {normalized.length < 2 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Type at least two characters to search your learning content.
          </CardContent>
        </Card>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Search failed"}
        </p>
      )}

      {normalized.length >= 2 && !isError && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isFetching ? "Searching..." : `${results.length} result${results.length === 1 ? "" : "s"}`}
            </p>
            {data?.query && <Badge variant="secondary">{data.query}</Badge>}
          </div>

          {!isFetching && results.length === 0 ? (
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
    </div>
  );
}

function SearchGroup({ type, results }: { type: SearchResultType; results: SearchResult[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{resultLabels[type]}s</CardTitle>
        <CardDescription>{results.length} matching item{results.length === 1 ? "" : "s"}</CardDescription>
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
          {result.subtitle && <p className="mt-1 text-xs text-muted-foreground">{result.subtitle}</p>}
          {result.snippet && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.snippet}</p>
          )}
        </div>
      </Link>
    </li>
  );
}
