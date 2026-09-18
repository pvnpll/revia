"use client";

import { useState } from "react";
import { Bot, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerationLevel, LearnerPreferences } from "@/lib/validators/ai";
import { GenerateCardsApiParams } from "../types/ai-session";

interface SuggestionPreset {
  title: string;
  goal: string;
  topic: string;
  level: GenerationLevel;
}

const PRESET_SUGGESTIONS: SuggestionPreset[] = [
  {
    title: "Kannada Basics",
    goal: "Speak everyday conversational Kannada",
    topic: "Greetings & Common Phrases",
    level: "beginner",
  },
  {
    title: "Spanish Travel",
    goal: "Travel in Spain & Latin America",
    topic: "Asking for Directions & Transport",
    level: "beginner",
  },
  {
    title: "Telugu Verbs",
    goal: "Learn conversational Telugu",
    topic: "Common Daily Action Verbs",
    level: "beginner",
  },
  {
    title: "Python Data Structures",
    goal: "Master modern Python programming",
    topic: "Dictionaries & Sets",
    level: "intermediate",
  },
];

interface AIGeneratorFormProps {
  onGenerate: (params: GenerateCardsApiParams) => void;
  isLoading: boolean;
  error?: Error | null;
}

export function AIGeneratorForm({ onGenerate, isLoading, error }: AIGeneratorFormProps) {
  const [goal, setGoal] = useState("Speak basic everyday Kannada");
  const [topic, setTopic] = useState("Greetings & Introductions");
  const [level, setLevel] = useState<GenerationLevel>("beginner");
  const [batchSize, setBatchSize] = useState<number>(10);
  const [provider, setProvider] = useState<"gemini" | "openrouter">("openrouter");
  const [preferences, setPreferences] = useState<LearnerPreferences>({
    romanization: true,
    examples: true,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  function applyPreset(preset: SuggestionPreset) {
    setGoal(preset.goal);
    setTopic(preset.topic);
    setLevel(preset.level);
    setValidationError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) {
      setValidationError("Please enter your learning goal");
      return;
    }
    if (!topic.trim()) {
      setValidationError("Please enter a specific topic");
      return;
    }
    setValidationError(null);

    onGenerate({
      goal: goal.trim(),
      topic: topic.trim(),
      level,
      batchSize,
      provider,
      context: {
        known: [],
        struggled: [],
        recentlySeen: [],
        preferences,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Revia AI</h1>
          <p className="text-sm text-muted-foreground">
            Generate adaptive, progressive flashcards with AI
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Suggestions
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SUGGESTIONS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground shadow-xs transition hover:bg-accent active:scale-95"
            >
              ✨ {preset.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Generation Settings</CardTitle>
            <CardDescription>
              Tailor the AI cards to your target language or subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ai-goal">Learning Goal</Label>
              <Input
                id="ai-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Speak basic everyday Kannada"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ai-topic">Specific Topic</Label>
              <Input
                id="ai-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Greetings, Ordering Food, Numbers"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label>AI Provider</Label>
              <div className="flex rounded-md border p-1 bg-muted/30">
                <button
                  type="button"
                  onClick={() => setProvider("openrouter")}
                  disabled={isLoading}
                  className={`flex-1 rounded-sm py-1.5 text-xs font-medium transition ${
                    provider === "openrouter"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ⚡ OpenRouter (Free Models)
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("gemini")}
                  disabled={isLoading}
                  className={`flex-1 rounded-sm py-1.5 text-xs font-medium transition ${
                    provider === "gemini"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ✨ Google Gemini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Difficulty Level</Label>
                <div className="flex rounded-md border p-1 bg-muted/30">
                  {(["beginner", "intermediate", "advanced"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      disabled={isLoading}
                      className={`flex-1 rounded-sm py-1.5 text-xs font-medium capitalize transition ${
                        level === l
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Batch Size</Label>
                <div className="flex rounded-md border p-1 bg-muted/30">
                  {[5, 10, 15].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchSize(count)}
                      disabled={isLoading}
                      className={`flex-1 rounded-sm py-1.5 text-xs font-medium transition ${
                        batchSize === count
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Options</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.romanization}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, romanization: e.target.checked }))
                    }
                    className="rounded border-input text-primary"
                    disabled={isLoading}
                  />
                  <span>Include Pronunciation / Romanization</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.examples}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, examples: e.target.checked }))
                    }
                    className="rounded border-input text-primary"
                    disabled={isLoading}
                  />
                  <span>Include Example Sentences</span>
                </label>
              </div>
            </div>

            {validationError && (
              <p className="text-sm font-medium text-destructive">{validationError}</p>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <p className="font-semibold">Generation Failed</p>
                <p className="mt-1">{error.message}</p>
                {error.message.includes("GEMINI_API_KEY") && (
                  <p className="mt-2 text-muted-foreground">
                    Tip: Make sure <code>GEMINI_API_KEY</code> is configured in your
                    environment variables.
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Wand2 className="h-4 w-4 animate-spin" />
                  Generating Cards with Revia AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Cards
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
