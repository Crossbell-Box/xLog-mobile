import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import * as homeModel from "@/models/home.model";

export const useGetFeed = (data?: Parameters<typeof homeModel.getFeed>[0]) => {
  return useInfiniteQuery({
    queryKey: ["getFeed", data],
    queryFn: async ({ pageParam }) => {
      const result = await homeModel.getFeed({
        ...data,
        cursor: pageParam,
      });

      return result;
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
  });
};

export const useGetShowcase = () => {
  return useQuery(["getShowcase"], async () => {
    return homeModel.getShowcase();
  });
};
