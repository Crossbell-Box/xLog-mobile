import type { FeedType as AllFeedType } from "@/models/home.model";

export type FeedType = Extract<AllFeedType, "latest" | "hottest" | "following">;

export const feedTypes: Record<Uppercase<FeedType>, FeedType> = {
  LATEST: "latest",
  HOTTEST: "hottest",
  FOLLOWING: "following",
};
