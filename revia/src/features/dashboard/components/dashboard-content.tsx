"use client";

import Link from "next/link";
import { GraduationCap, Layers, ListChecks, Flame } from "lucide-react";

import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
  const { data, isLoading, isError, error } = useDashboard();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data) {
    return (
      <p className="text-destructive">
        {error instanceof Error ? error.message : "Failed to load dashboard"}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Your daily learning overview</p>
        </div>
        <Button asChild size="lg" variant={data.dueToday > 0 ? "default" : "secondary"}>
          <Link href={data.dueToday > 0 ? "/review" : "/decks"}>
            <GraduationCap className="h-4 w-4" />
            {data.dueToday > 0 ? `Review ${data.dueToday} cards` : "Browse Decks"}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Due Today" value={data.dueToday} description="Cards ready for review" />
        <StatCard title="Reviewed Today" value={data.reviewedToday} description="Completed reviews" />
        <StatCard
          title="Streak"
          value={data.streak}
          description="Consecutive days"
          icon={<Flame className="h-4 w-4 text-orange-500" />}
        />
        <StatCard title="Total Cards" value={data.totalCards} description="Across all decks" />
        <StatCard title="Decks" value={data.deckCount} description="Active decks" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Recent Decks
          </CardTitle>
          <CardDescription>Jump back into your latest decks</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentDecks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No decks yet. Create your first deck.</p>
              <Button asChild variant="outline">
                <Link href="/decks">Create a Deck</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {data.recentDecks.map((deck) => (
                <li key={deck.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: deck.color }}
                    />
                    <div>
                      <Link href={`/decks/${deck.id}`} className="font-medium hover:underline">
                        {deck.title}
                      </Link>
                      {deck.subject && (
                        <p className="text-xs text-muted-foreground">{deck.subject}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {deck.dueCount > 0 && <Badge variant="default">{deck.dueCount} due</Badge>}
                    <Badge variant="outline" className="font-normal">
                      <ListChecks className="mr-1 h-3 w-3" />
                      {deck.cardCount} cards
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1">
          {title} {icon}
        </CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
