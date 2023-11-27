import { useEffect, useMemo } from "react";

import { useCharacterId } from "@/hooks/use-character-id";
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
  const gaLog = debounce(() => GA.logSearch({ search_term: searchKeyword }), 2000);

  useEffect(() => {
    typeof searchKeyword === "string" && gaLog();
  }, [searchKeyword]);

  const queryParams = useMemo(() => ({
    type,
    handle,
    visibility,
    limit,
    characterId: characterId ?? _characterId,
    daysInterval: daysInterval ?? null,
    searchKeyword: searchKeyword ?? null,
    tags: tags ?? [],
  } as GetFeedParams), [
    type,
    handle,
    visibility,
    characterId,
    _characterId,
    daysInterval,
    searchKeyword,
    tags,
  ]);

  const feed = type === "shorts" && !!characterId
    ? useGetPagesBySiteLite({ // Searching specific note by characterId
      characterId,
      visibility,
      limit,
      useStat: true,
      type: ["short"],
      sortType: "latest",
    })
    : useGetFeed(queryParams); // Searching notes by feed type

  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [feed.data?.pages]);

  return {
    feedList,
    feed,
  };
};
