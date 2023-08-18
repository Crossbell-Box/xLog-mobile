import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

import * as homeModel from "@/models/home.model";
import { toGateway } from "@/utils/ipfs-parser";

export const useGetFeed = (data?: Parameters<typeof homeModel.getFeed>[0]) => {
  return useInfiniteQuery({
    queryKey: ["getFeed", data],
    queryFn: async ({ pageParam }) => {
      const result = await homeModel.getFeed({
        ...data,
        cursor: pageParam,
      });

      // TODO
      Image.prefetch(result.list.map(item => toGateway(item.metadata?.content?.images?.[0])).filter(Boolean));

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
