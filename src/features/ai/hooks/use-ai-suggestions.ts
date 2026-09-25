import { useQuery } from "@tanstack/react-query";

export function useAiSuggestions(enabled: boolean) {
  return useQuery({
    queryKey: ["ai-suggestions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/generate/suggestions");
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      return (data.data?.suggestions || []) as string[];
    },
    enabled,
    staleTime: Infinity,
  });
}
