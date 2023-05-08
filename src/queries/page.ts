import { useInfiniteQuery } from "@tanstack/react-query";

import { getPagesBySite } from "@/models/page.model";

export const useGetPagesBySite = (
  input: Parameters<typeof getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      return getPagesBySite({
        ...input,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage.cursor || undefined,
  });
};
