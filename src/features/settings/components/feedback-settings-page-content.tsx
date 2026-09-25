"use client";

import { useState } from "react";

import { feedbackApi } from "@/features/feedback/services/feedback-api";
import { SettingsSubpage } from "@/features/settings/components/settings-subpage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import type { FeedbackInput } from "@/lib/validators/feedback.schema";

const feedbackTypes: { value: FeedbackInput["type"]; label: string }[] = [
  { value: "suggestion", label: "Suggestion" },
  { value: "bug", label: "Bug report" },
];

export function FeedbackSettingsPageContent() {
  const [type, setType] = useState<FeedbackInput["type"]>("suggestion");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await feedbackApi.submit({ type, message });
      setMessage("");
      setSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to send feedback",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsSubpage
      title="Feedback"
      description="Share ideas or report something that isn't working."
    >
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                      type === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-message">Message</Label>
              <Textarea
                id="feedback-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={
                  type === "bug"
                    ? "What happened? Steps to reproduce help a lot."
                    : "What would make Revia better for you?"
                }
                rows={6}
                required
                minLength={10}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? (
              <p className="text-sm text-primary">Thanks — your feedback was sent.</p>
            ) : null}

            <Button type="submit" disabled={loading || message.trim().length < 10}>
              {loading ? "Sending..." : "Send feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </SettingsSubpage>
  );
}
