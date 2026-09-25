import { NextResponse } from "next/server";

import { userRepository } from "@/lib/repositories/user.repository";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/practice";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await userRepository.ensureUser({
          id: user.id,
          email: user.email ?? `${user.id}@unknown.local`,
          name:
            (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) ??
            (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null),
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
