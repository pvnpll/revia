import { redirect } from "next/navigation";

import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isSupabaseAuthEnabled()) {
    redirect("/practice");
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  redirect(session ? "/practice" : "/explore");
}
