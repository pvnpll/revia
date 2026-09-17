"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  redirectPath?: string;
  /** Show a "Continue as guest" link back to Explore. Defaults to true. */
  showGuestLink?: boolean;
}

export function LoginRequired({
  title = "Sign in to continue",
  description = "Create a free account or sign in to use this feature. Browsing and practicing public decks does not require an account.",
  redirectPath,
  showGuestLink = true,
}: LoginRequiredProps) {
  const pathname = usePathname();
  const redirect = redirectPath ?? pathname;
  const loginHref = `/login?redirect=${encodeURIComponent(redirect)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(redirect)}`;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild className="w-full">
          <Link href={loginHref}>Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href={signupHref}>Create account</Link>
        </Button>
        {showGuestLink && (
          <Button asChild variant="ghost" className="w-full">
            <Link href="/explore">
              <Compass className="h-4 w-4" />
              Continue as guest
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
