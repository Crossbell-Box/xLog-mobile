import type { FeedType as AllSearchType } from "@/models/home.model";

export type PostSearchType = Extract<AllSearchType, "featured" | "hottest" | "following">;
export type ShortsSearchType = Extract<AllSearchType, "shorts">;

export const postSearchTypes: Record<Uppercase<PostSearchType>, PostSearchType> = {
  FEATURED: "featured",
  HOTTEST: "hottest",
  FOLLOWING: "following",
};

export const shortsSearchTypes: Record<Uppercase<ShortsSearchType>, ShortsSearchType> = {
  SHORTS: "shorts",
};
