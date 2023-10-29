import { useCallback, useEffect, useMemo, useRef } from "react";
import { RefreshControl } from "react-native-gesture-handler";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import type { ContentStyle, MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { SizableText, Spinner, Stack, useWindowDimensions, YStack } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { GetFeedParams } from "@/queries/home";
import { useGetFeed } from "@/queries/home";
import type { PageVisibilityEnum } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";
import { debounce } from "@/utils/debounce";
import { GA } from "@/utils/GA";

import { FeedListItem } from "./FeedListItem";
import { Skeleton } from "./Skeleton";

export interface Props {
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>
  type?: GetFeedParams["type"]
  /**
   * @default 7
   * */
  daysInterval?: number
  searchKeyword?: string
  tags?: string[]
  topic?: string
  handle?: string
  contentContainerStyle?: ContentStyle
  characterId?: number
  ListHeaderComponent?: React.ReactNode
  visibility?: PageVisibilityEnum
}

export const useFeedList = <T extends {}>(props: Props & T) => {
  const { ListHeaderComponent, visibility, handle, type, searchKeyword, contentContainerStyle = {}, tags = [], topic, daysInterval = 7, onScroll, characterId, ...restProps } = props;
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

  const queryParams = useMemo<GetFeedParams>(() => ({
    type,
    handle,
    visibility,
    limit: 15,
    characterId: characterId ?? _characterId,
    daysInterval,
    searchKeyword,
    tags,
  }), [
    type,
    handle,
    visibility,
    characterId,
    _characterId,
    daysInterval,
    searchKeyword,
    tags,
  ]);

  const feed = useGetFeed(queryParams);
  const feedList = useMemo(() => (feed.data?.pages?.flatMap(page => page?.list) || []), [feed.data?.pages]);
  const onEndReached = useCallback(() => {
    if (
      feedList.length === 0
        || feed.isFetching
        || feed.hasNextPage === false
    )
      return;

    feed?.fetchNextPage?.();
  }, [
    feedList.length,
    feed.isFetching,
    feed.hasNextPage,
    feed.fetchNextPage,
    queryParams,
  ]);

  return useMemo<MasonryFlashListProps<any>>(() => ({
    data: feedList,
    ref: listRef,
    numColumns: 2,
    keyExtractor: post => `${post.characterId}-${post.noteId}`,
    renderItem: ({ item, index }) => (
      <FeedListItem width={width / 2 - 12} key={index} note={item} searchKeyword={searchKeyword}/>
    ),
    ListEmptyComponent: <Stack>
      {
        feed.isFetching && feedList.length === 0
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
    ListHeaderComponent,
    ListFooterComponent: feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>,
    contentContainerStyle: { ...contentContainerStyle, paddingHorizontal: 4 },
    scrollEventThrottle: 16,
    onScroll,
    refreshControl: <RefreshControl
      refreshing={feed.isRefetching}
      onRefresh={feed.refetch}
      progressViewOffset={50}
    />,
    onEndReachedThreshold: 0.5,
    onEndReached,
    ...(restProps as any),
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
