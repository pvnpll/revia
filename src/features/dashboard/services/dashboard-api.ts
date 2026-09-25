import { fetchJson } from "@/lib/utils/fetch-json";
import type { DashboardSummary } from "@/types/dashboard";

export const dashboardApi = {
  getSummary(): Promise<DashboardSummary> {
    return fetchJson<DashboardSummary>("/api/dashboard");
  },
};
