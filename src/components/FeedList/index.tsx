import type { FC } from "react";
import { useEffect, useMemo } from "react";
import { type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import { Separator, SizableText, Spinner, Stack, useWindowDimensions } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { FeedType, SearchType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";
import type { ExpandedNote } from "@/types/crossbell";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import { FeedListItem } from "./FeedListItem";

import topics from "../../data/topics.json";
import { Center } from "../Center";
import { FillSpinner } from "../FillSpinner";
import { ReanimatedFlashList } from "../ReanimatedFlashList";
import { MeasureContainer } from "../utils/MeasureContainer";

export interface Props {
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
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
}

export const FeedList: FC<Props> = (props) => {
  const { type, searchType, searchKeyword, tag, topic, noteIds, daysInterval = 7, onScroll, onScrollEndDrag } = props;
  const characterId = useCharacterId();
  const gaLog = debounce(() => GA.logSearch({ search_term: searchKeyword }), 2000);

  useEffect(() => {
    typeof searchKeyword === "string" && gaLog();
  }, [searchKeyword]);

  const queryParams = useMemo(() => ({
    type,
    limit: 10,
    characterId,
    noteIds,
    daysInterval,
    searchKeyword,
    searchType,
    tag,
    topicIncludeKeywords: topic
      ? topics.find(t => t.name === topic)?.includeKeywords
      : undefined,
  }), [props]);

  const feed = useGetFeed(queryParams);

  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [
    feed.data?.pages,
  ]);

  return (
    <MeasureContainer flex={1}>
      {
        ({ height }) => (
          <ReanimatedFlashList<ExpandedNote>
            data={feedList}
            keyExtractor={post => `${post.characterId}-${post.noteId}`}
            renderItem={({ item, index }) => (
              <FeedListItem key={index} note={item} searchKeyword={searchKeyword}/>
            )}
            ListEmptyComponent={(
              <Stack minHeight={height}>
                {
                  feed.isFetching
                    ? <FillSpinner/>
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
            ListFooterComponent={feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>}
            ItemSeparatorComponent={() => <Separator borderColor={"$gray5"}/>}
            estimatedItemSize={324}
            bounces
            scrollIndicatorInsets={{
              right: 2,
            }}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onScrollEndDrag={onScrollEndDrag}
            onEndReachedThreshold={0.5}
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
        )
      }
    </MeasureContainer>
  );
};
