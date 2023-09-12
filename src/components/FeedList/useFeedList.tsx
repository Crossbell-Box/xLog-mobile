import { useEffect, useMemo, useRef } from "react";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import type { ContentStyle, MasonryFlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { SizableText, Spinner, Stack, useWindowDimensions, YStack } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { FeedType, SearchType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";
import type { ExpandedNote } from "@/types/crossbell";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import { FeedListItem } from "./FeedListItem";
import { Skeleton } from "./Skeleton";

import topics from "../../data/topics.json";

export interface Props {
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>
  type?: FeedType
  noteIds?: string[]
  /**
   * @default 7
   * */
  daysInterval?: number
  searchKeyword?: string
  tag?: string
  topic?: string
  searchType?: SearchType
  contentContainerStyle?: ContentStyle
  characterId?: number
}

export const useFeedList = <T extends {}>(props: Props & T) => {
  const { type, searchType, searchKeyword, contentContainerStyle = {}, tag, topic, noteIds, daysInterval = 7, onScroll, characterId, ...restProps } = props;
  const _characterId = useCharacterId();
  const gaLog = debounce(() => GA.logSearch({ search_term: searchKeyword }), 2000);
  const { width } = useWindowDimensions();
  const listRef = useRef<MasonryFlashListRef<ExpandedNote>>(null);

  useEffect(() => {
    typeof searchKeyword === "string" && gaLog();
  }, [searchKeyword]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [type, daysInterval]);

  const queryParams = useMemo(() => ({
    type,
    limit: 15,
    characterId: characterId ?? _characterId,
    noteIds,
    daysInterval,
    searchKeyword,
    searchType,
    tag,
    topicIncludeKeywords: topic
      ? topics.find(t => t.name === topic)?.includeKeywords
      : undefined,
  }), [
    type,
    characterId,
    _characterId,
    noteIds,
    daysInterval,
    searchKeyword,
    searchType,
    tag,
    topic,
  ]);

  const feed = useGetFeed(queryParams);
  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [feed.data?.pages]);

  return useMemo(() => ({
    data: feedList,
    ref: listRef,
    numColumns: 2,
    keyExtractor: post => `${post.characterId}-${post.noteId}`,
    renderItem: ({ item, index }) => (
      <FeedListItem width={width / 2 - 12} key={index} note={item} searchKeyword={searchKeyword}/>
    ),
    ListEmptyComponent: <Stack>
      {
        feed.isFetching
          ? <Skeleton itemWidth={width / 2 - 12}/>
          : (
            <YStack minHeight={300} alignItems="center" justifyContent="center" gap="$2">
              <Image
                source={require("../../assets/post-list-empty.png")}
                style={{ width: 100, height: 100 }}
                contentFit="contain"
              />
              <SizableText color={"$colorUnActive"} size="$5">
                There are no posts yet.
              </SizableText>
            </YStack>
          )
      }
    </Stack>,
    bounces: true,
    estimatedItemSize: 251,
    ListFooterComponent: feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>,
    contentContainerStyle: { ...contentContainerStyle, paddingHorizontal: 4 },
    scrollEventThrottle: 16,
    onScroll,
    onEndReachedThreshold: 0.5,
    onEndReached: () => {
      if (
        feedList.length === 0
          || feed.isFetchingNextPage
          || feed.hasNextPage === false
      )
        return;

      GA.logEvent("feed_list_view", {
        feed_length: feedList.length,
        feed_type: queryParams.type,
        query_limit: queryParams.limit,
        character_id: queryParams.characterId,
        note_ids: queryParams.noteIds,
        days_interval: queryParams.daysInterval,
        search_keyword: queryParams.searchKeyword,
        search_type: queryParams.searchType,
        tag: queryParams.tag,
        topic_include_keywords: queryParams.topicIncludeKeywords,
      });

      feed?.fetchNextPage?.();
    },
    ...(restProps as T),
  }), [
    feed,
    width,
    contentContainerStyle,
    onScroll,
    restProps,
    queryParams,
    searchKeyword,
    feedList,
  ]);
};
