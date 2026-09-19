import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiApi } from "../services/ai-api";
import { LearnerContext } from "@/lib/validators/ai";

export function useAIContext(topic: string | undefined) {
  return useQuery({
    queryKey: ["ai-context", topic],
    queryFn: () => aiApi.getContext(topic!),
    enabled: !!topic,
  });
}

export function useUpdateAIContext() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topic, updates }: { topic: string; updates: Partial<LearnerContext> }) =>
      aiApi.updateContext(topic, updates),
    onSuccess: (updatedContext, { topic }) => {
      queryClient.setQueryData(["ai-context", topic], updatedContext);
    },
  });
}
