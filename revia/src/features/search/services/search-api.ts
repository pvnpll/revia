import { fetchJson } from "@/lib/utils/fetch-json";
import type { SearchResponse } from "@/types/search";

export const searchApi = {
  search(query: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, limit: "30" });
    return fetchJson<SearchResponse>(`/api/search?${params.toString()}`);
  },
};
