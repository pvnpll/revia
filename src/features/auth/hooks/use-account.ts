"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/features/auth/services/account-api";
import type { UpdateUsernameInput } from "@/lib/validators/username.schema";

export const accountQueryKeys = {
  profile: ["account", "profile"] as const,
};

export function useAccountProfile() {
  return useQuery({
    queryKey: accountQueryKeys.profile,
    queryFn: () => accountApi.getProfile(),
    staleTime: 60_000,
    retry: false,
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateUsernameInput) => accountApi.updateUsername(input),
    onSuccess: (profile) => {
      queryClient.setQueryData(accountQueryKeys.profile, profile);
    },
  });
}
