import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import * as homeModel from "@/models/home.model";

export const useGetFeed = (data?: {
  type?: homeModel.FeedType
  characterId?: number
  limit?: number
  noteIds?: string[]
  daysInterval?: number
}) => {
  return useInfiniteQuery({
    queryKey: ["getFeed", data],
    queryFn: async ({ pageParam }) => {
      return homeModel.getFeed({
        ...data,
        cursor: pageParam,
      });
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetShowcase = () => {
  return useQuery(["getShowcase"], async () => {
    return homeModel.getShowcase();
  });
};
