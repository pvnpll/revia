import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  const isProd = process.env.NODE_ENV === "production";

  return createBrowserClient(url, anonKey, {
    cookieOptions: {
      maxAge: 31536000,
      secure: isProd,
      sameSite: "lax",
    },
  });
}
