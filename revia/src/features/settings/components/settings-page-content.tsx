"use client";

import Link from "next/link";
import { BookOpen, Info } from "lucide-react";

import { ThemeSetting } from "@/components/layout/theme-setting";
import { AccountSettings } from "@/features/auth/components/account-settings";
import { CreateDeckForm } from "@/features/decks/components/create-deck-form";
import { ImportDeckForm } from "@/features/import/components/import-deck-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SettingsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage decks, appearance, and app preferences.
        </p>
      </div>

      <AccountSettings />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how Revia looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSetting />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Deck</CardTitle>
          <CardDescription>Upload a JSON or text file to add cards and lessons.</CardDescription>
        </CardHeader>
        <CardContent>
          <ImportDeckForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Deck</CardTitle>
          <CardDescription>Start a new deck for any subject or language.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateDeckForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Library</CardTitle>
          <CardDescription>Jump back to your decks and lessons.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <Link href="/decks">
              <BookOpen className="h-4 w-4" />
              Browse decks
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About Revia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Mobile-first spaced repetition app for flashcard learning.</p>
          <p>Study due cards from Review, organize content in Decks, and track progress on Home.</p>
        </CardContent>
      </Card>
    </div>
  );
}
