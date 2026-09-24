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
import { cn } from "@/lib/utils/cn";
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


const LEVELS: GenerationLevel[] = ["beginner", "intermediate", "advanced"];
const BATCH_SIZES = [5, 10, 15];

const segmentedButtonBase =
  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
      provider: "ollama",
      context: {
        known: [],
        struggled: [],
        recentlySeen: [],
        preferences,
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Bot className="h-6 w-6 text-primary" aria-hidden />
          Revia AI
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate adaptive, progressive flashcards with AI
        </p>
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
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} aria-busy={isLoading}>
        <Card>
          <CardHeader>
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


            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label id="ai-level-label">Difficulty Level</Label>
                <div
                  role="group"
                  aria-labelledby="ai-level-label"
                  className="flex rounded-lg border bg-muted p-1"
                >
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      disabled={isLoading}
                      aria-pressed={level === l}
                      className={cn(
                        segmentedButtonBase,
                        level === l
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="capitalize">{l}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label id="ai-batch-label">Batch Size</Label>
                <div
                  role="group"
                  aria-labelledby="ai-batch-label"
                  className="flex rounded-lg border bg-muted p-1"
                >
                  {BATCH_SIZES.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchSize(count)}
                      disabled={isLoading}
                      aria-pressed={batchSize === count}
                      className={cn(
                        segmentedButtonBase,
                        batchSize === count
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 rounded-xl border bg-muted/40 p-3">
              <p className="text-xs font-semibold text-muted-foreground">Options</p>
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-x-4 sm:text-xs">
                <label className="flex min-h-9 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.romanization}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, romanization: e.target.checked }))
                    }
                    className="h-4 w-4 shrink-0 accent-primary"
                    disabled={isLoading}
                  />
                  <span>Include pronunciation / romanization</span>
                </label>
                <label className="flex min-h-9 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.examples}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, examples: e.target.checked }))
                    }
                    className="h-4 w-4 shrink-0 accent-primary"
                    disabled={isLoading}
                  />
                  <span>Include example sentences</span>
                </label>
              </div>
            </div>

            {validationError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {validationError}
              </p>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <p className="font-semibold">Generation failed</p>
                <p className="mt-1 text-xs">{error.message}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="lg"
              className="w-full font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Wand2 className="h-4 w-4 animate-spin" aria-hidden />
                  <span aria-live="polite">Generating cards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" aria-hidden />
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
