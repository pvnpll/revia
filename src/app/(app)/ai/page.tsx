import { Metadata } from "next";
import { AIModeContent } from "@/features/ai/components/ai-mode-content";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Revia AI — Adaptive Flashcards",
  description: "Generate adaptive spaced repetition flashcards with Revia AI",
};

export default async function AIPage() {
  let isGuest = false;
  if (isSupabaseAuthEnabled()) {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    isGuest = !session;
  }
  return <AIModeContent isGuest={isGuest} />;
}