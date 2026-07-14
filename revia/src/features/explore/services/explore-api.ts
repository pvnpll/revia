import { fetchJson } from "@/lib/utils/fetch-json";
import type { ExploreResponse } from "@/types/explore";

export const exploreApi = {
  list(query = "", limit = 20): Promise<ExploreResponse> {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("limit", String(limit));
    return fetchJson<ExploreResponse>(`/api/explore?${params.toString()}`);
  },
};
