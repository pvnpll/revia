import { PageSkeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <PageSkeleton />
    </div>
  );
}
