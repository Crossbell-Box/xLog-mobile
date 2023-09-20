import type { SearchType as AllSearchType } from "@/models/home.model";

export type SearchType = Extract<AllSearchType, "latest" | "hottest" | "following">;

export const searchTypes: Record<Uppercase<SearchType>, SearchType> = {
  LATEST: "latest",
  HOTTEST: "hottest",
  FOLLOWING: "following",
};
