import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  return createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: 31536000,
      secure: isProd,
      sameSite: "lax",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, { ...options, maxAge: 31536000, secure: isProd });
          });
        } catch {
          // Called from a Server Component; middleware will refresh the session.
        }
      },
    },
  });
}
