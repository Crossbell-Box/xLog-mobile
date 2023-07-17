import type { FC } from "react";
import { useEffect, useMemo } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import { useFocusEffect } from "@react-navigation/native";
import type { NoteEntity } from "crossbell";
import { Separator, SizableText, Spinner, Stack, useWindowDimensions } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { FeedType, SearchType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import { FeedListItem } from "./FeedListItem";

import topics from "../../data/topics.json";
import { ReanimatedFlashList } from "../ReanimatedFlashList";

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
  const { width, height } = useWindowDimensions();
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

  const feedList = feed.data?.pages?.flatMap(page => page?.list) || [];

  return (
    <Stack flex={1}>
      <ReanimatedFlashList<NoteEntity>
        data={feedList}
        keyExtractor={(post, index) => `${type}-${post?.noteId}-${index}`}
        renderItem={({ item, index }) => (
          <FeedListItem key={index} note={item} searchKeyword={searchKeyword}/>
        )}
        ListEmptyComponent={(
          feed.isFetching
            ? <Spinner paddingBottom="$5"/>
            : (
              <Stack flex={1} alignItems="center" justifyContent="center" paddingTop="$10">
                <SizableText color={"$colorSubtitle"}>
              There are no posts yet.
                </SizableText>
              </Stack>
            )
        )}
        ListFooterComponent={feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>}
        ItemSeparatorComponent={() => <Separator borderColor={"$gray5"}/>}
        estimatedItemSize={238}
        bounces
        estimatedListSize={{
          height: height * 0.8,
          width,
        }}
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
    </Stack>
  );
};
