import { Metadata } from "next";
import { AIModeContent } from "@/features/ai/components/ai-mode-content";

export const metadata: Metadata = {
  title: "Revia AI — Adaptive Flashcards",
  description: "Generate adaptive spaced repetition flashcards with Revia AI",
};

export default function AIPage() {
  return <AIModeContent />;
}

