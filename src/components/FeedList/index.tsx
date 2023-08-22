import type { FC } from "react";
import { useEffect, useMemo, useRef } from "react";
import type { useAnimatedScrollHandler } from "react-native-reanimated";
import Animated from "react-native-reanimated";

import type { ContentStyle, MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { SizableText, Spinner, Stack, useWindowDimensions } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { FeedType, SearchType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";
import type { ExpandedNote } from "@/types/crossbell";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import { FeedListItem } from "./FeedListItem";
import { Skeleton } from "./Skeleton";

import topics from "../../data/topics.json";
import { Center } from "../Base/Center";
import { FillSpinner } from "../FillSpinner";
import { MasonryFlashList } from "../MasonryFlashList";
import { MeasureContainer } from "../utils/MeasureContainer";

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
}

export const FeedList: FC<Props> = (props) => {
  const { type, searchType, searchKeyword, contentContainerStyle = {}, tag, topic, noteIds, daysInterval = 7, onScroll } = props;
  const characterId = useCharacterId();
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
    limit: 30,
    characterId,
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
    noteIds,
    daysInterval,
    searchKeyword,
    searchType,
    tag,
    topic,
  ]);

  // TODO
  const feed = useGetFeed(queryParams);
  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [feed.data?.pages]);

  return (
    <MasonryFlashList<ExpandedNote>
      data={feedList}
      ref={listRef}
      numColumns={2}
      keyExtractor={post => `${post.characterId}-${post.noteId}`}
      renderItem={({ item, index }) => (
        <FeedListItem width={width / 2 - 12} key={index} note={item} searchKeyword={searchKeyword}/>
      )}
      ListEmptyComponent={(
        <Stack>
          {
            feed.isFetching
              ? <Skeleton itemWidth={width / 2 - 12}/>
              : (
                <Center flex={1}>
                  <SizableText color={"$colorSubtitle"}>
      There are no posts yet.
                  </SizableText>
                </Center>
              )
          }
        </Stack>
      )}
      bounces
      estimatedItemSize={251}
      ListFooterComponent={feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>}
      contentContainerStyle={{ ...contentContainerStyle, paddingHorizontal: 4 }}
      scrollEventThrottle={16}
      onScroll={onScroll}
      onEndReachedThreshold={2}
      onEndReached={() => {
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
      }}
    />
  );
};
