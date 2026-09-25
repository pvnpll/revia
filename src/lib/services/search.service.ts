import { searchRepository } from "@/lib/repositories/search.repository";
import type { SearchInput } from "@/lib/validators/search.schema";
import type { SearchResponse } from "@/types/search";

export const searchService = {
  async search(userId: string, input: SearchInput): Promise<SearchResponse> {
    return searchRepository.search({
      userId,
      query: input.q,
      limit: input.limit,
    });
  },
};
