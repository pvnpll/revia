"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";

import { LoginRequired } from "@/features/auth/components/login-required";
import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { PracticeSession } from "@/features/practice/components/practice-session";
import { useDeck } from "@/features/decks/hooks/use-decks";
import { useLessons } from "@/features/lessons/hooks/use-lessons";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/ui/skeleton";

export function PracticePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthSession();
  const deckId = searchParams.get("deckId") ?? undefined;
  const lessonId = searchParams.get("lessonId") ?? undefined;
  const reverseMode = searchParams.get("reverse") === "1";

  const { data: deck } = useDeck(deckId ?? "");
  const { data: lessons = [] } = useLessons(deckId ?? "");

  if (!deckId) {
    if (authLoading) {
      return <PageSkeleton />;
    }

    if (!isAuthenticated) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Practice</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Open a public deck from Explore to start practicing — no account needed.
            </p>
          </div>
          <Button asChild size="lg" className="w-full">
            <Link href="/explore">
              <Compass className="h-4 w-4" />
              Browse public decks
            </Link>
          </Button>
          <LoginRequired
            title="Or sign in for your library"
            description="Your own decks, imports, and Daily Review progress require an account."
            redirectPath="/practice"
          />
        </div>
      );
    }
  }

  const activeLesson = lessonId ? lessons.find((lesson) => lesson.id === lessonId) : undefined;
  const title = activeLesson?.title ?? deck?.title ?? "Practice";

  return (
    <PracticeSession
      title={title}
      deckId={deckId}
      lessonId={lessonId}
      reverseMode={reverseMode}
      onClose={() => router.push(deckId ? `/decks/${deckId}` : isAuthenticated ? "/dashboard" : "/explore")}
    />
  );
}
