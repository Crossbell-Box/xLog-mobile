import { useEffect, useMemo } from "react";

import { useGlobalState } from "@/context/global-state-context";
import { useCharacterId } from "@/hooks/use-character-id";
import type { GetPagesBySite } from "@/models/page.model";
import type { GetFeedParams } from "@/queries/home";
import { useGetFeed } from "@/queries/home";
import { useGetPagesBySiteLite } from "@/queries/page";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import type { Props } from "./useFeedList";

export const useFeedData = (props: Props) => {
  const {
    handle,
    type,
    searchKeyword,
    tags,
    characterId,
    daysInterval,
    visibility,
  } = props;

  const limit = 15;
  const _characterId = useCharacterId();
  const { language } = useGlobalState();
  const gaLog = debounce(() => GA.logSearch({ search_term: searchKeyword }), 2000);

  useEffect(() => {
    typeof searchKeyword === "string" && gaLog();
  }, [searchKeyword]);

  const queryPageParams = useMemo(() => ({
    characterId,
    visibility,
    limit,
    useStat: true,
    useImageDimensions: true,
    type: ["short"],
    sortType: "latest",
  } as Parameters<GetPagesBySite>[0]), [
    characterId,
    visibility,
    limit,
  ]);

  const queryFeedParams = useMemo(() => ({
    type,
    handle,
    visibility,
    limit,
    characterId: characterId ?? _characterId,
    daysInterval: daysInterval ?? null,
    searchKeyword: searchKeyword ?? null,
    tags: tags ?? [],
    useImageDimensions: true,
    translateTo: language,
  } as GetFeedParams), [
    type,
    language,
    handle,
    visibility,
    characterId,
    _characterId,
    daysInterval,
    searchKeyword,
    tags,
  ]);

  const feed = type === "shorts" && !!characterId
    ? useGetPagesBySiteLite(queryPageParams) // Searching specific note by characterId
    : useGetFeed(queryFeedParams); // Searching notes by feed type

  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [feed.data?.pages]);

  return {
    feedList,
    feed,
  };
};
