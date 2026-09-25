import { Suspense } from "react";

import { PracticePageContent } from "@/features/practice/components/practice-page-content";
import { PageSkeleton } from "@/components/ui/skeleton";

export default function PracticePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PracticePageContent />
    </Suspense>
  );
}
