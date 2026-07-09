"use client";

import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/features/dashboard/services/dashboard-api";

export const dashboardQueryKeys = {
  summary: ["dashboard"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary,
    queryFn: () => dashboardApi.getSummary(),
  });
}
