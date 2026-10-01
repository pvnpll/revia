import { PageSkeleton } from "@/components/ui/skeleton";

export default function DeckDetailLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <PageSkeleton />
    </div>
  );
}
