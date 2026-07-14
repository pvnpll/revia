"use client";

import { useEffect, useState } from "react";

import { useAccountProfile, useUpdateUsername } from "@/features/auth/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidUsernameFormat, normalizeUsername } from "@/lib/username";

export function UsernameSettings() {
  const { data: profile, isLoading, isError } = useAccountProfile();
  const updateUsername = useUpdateUsername();
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-muted-foreground">Loading username...</CardContent>
      </Card>
    );
  }

  if (isError || !profile) {
    return null;
  }

  const normalized = normalizeUsername(username);
  const formatError =
    touched && normalized && !isValidUsernameFormat(normalized)
      ? "Use 3–30 lowercase letters, numbers, _ or -"
      : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);

    if (!isValidUsernameFormat(normalized) || normalized === profile?.username) {
      return;
    }

    updateUsername.mutate({ username: normalized });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Username</CardTitle>
        <CardDescription>
          Your public name on shared decks. You can change the auto-assigned username anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">@</span>
              <Input
                id="username"
                value={username}
                onChange={(event) => {
                  setTouched(true);
                  setUsername(event.target.value);
                }}
                autoComplete="username"
                spellCheck={false}
              />
            </div>
            {formatError ? <p className="text-sm text-destructive">{formatError}</p> : null}
            {updateUsername.isError ? (
              <p className="text-sm text-destructive">
                {updateUsername.error instanceof Error
                  ? updateUsername.error.message
                  : "Failed to update username"}
              </p>
            ) : null}
            {updateUsername.isSuccess ? (
              <p className="text-sm text-primary">Username updated.</p>
            ) : null}
          </div>
          <Button
            type="submit"
            disabled={
              updateUsername.isPending ||
              normalized === profile.username ||
              !isValidUsernameFormat(normalized)
            }
          >
            {updateUsername.isPending ? "Saving..." : "Save username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
