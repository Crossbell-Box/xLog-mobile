import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { APP_HOST } from "@/constants/env";
import * as homeModel from "@/models/home.model";
import type { getPagesBySite } from "@/models/page.model";

import { useGetPagesBySite } from "./page";

export type GetFeedParams = homeModel.GetFeedOptions | Parameters<typeof getPagesBySite>[0];

export const useGetFeed = (
  data?: GetFeedParams,
) => {
  if (data.type === "page" || data.type === "post") {
    return useGetPagesBySite(data);
  }

  return useInfiniteQuery({
    queryKey: ["getFeed", data],
    queryFn: async ({ pageParam }) => {
      const result: homeModel.GetFeedResult = await (
        await fetch(
          `${APP_HOST}/api/feed?${
            new URLSearchParams({
              ...data,
              ...(pageParam && { cursor: pageParam }),
            } as any)}`,
        )
      ).json();
      return result;
    },
    getNextPageParam: lastPage => lastPage?.cursor || undefined,
    refetchOnWindowFocus: false,
  });
};

export const useGetShowcase = () => {
  return useQuery(["getShowcase"], async () => {
    return homeModel.getShowcase();
  });
};
