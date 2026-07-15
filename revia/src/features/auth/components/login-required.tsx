"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LoginRequiredProps {
  title?: string;
  description?: string;
  redirectPath?: string;
}

export function LoginRequired({
  title = "Sign in to continue",
  description = "Create a free account or sign in to use this feature. Browsing and practicing public decks does not require an account.",
  redirectPath,
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
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild className="w-full sm:w-auto">
          <Link href={loginHref}>Sign in</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={signupHref}>Create account</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
