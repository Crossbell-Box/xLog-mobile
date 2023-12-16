import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl } from "react-native";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import type { ContentStyle, MasonryFlashListProps, MasonryFlashListRef } from "@shopify/flash-list";
import { Image } from "expo-image";
import { SizableText, Spinner, Stack, useWindowDimensions, YStack } from "tamagui";

import { usePostIndicatorStore } from "@/hooks/use-post-indicator-store";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { GetFeedParams } from "@/queries/home";
import type { PageVisibilityEnum } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";

import { FeedListItem } from "./FeedListItem";
import { Skeleton } from "./Skeleton";
import { useFeedData } from "./useFeedData";

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
  updateFeedAfterPost?: boolean
}

export const useFeedList = <T extends {}>(props: Props & T) => {
  const { ListHeaderComponent, updateFeedAfterPost = false, visibility, handle, type, searchKeyword, contentContainerStyle = {}, tags = [], topic, daysInterval = 7, onScroll, characterId, ...restProps } = props;
  const { width } = useWindowDimensions();
  const { feedList, feed } = useFeedData(props);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const listRef = useRef<MasonryFlashListRef<ExpandedNote>>(null);
  const { isDarkMode } = useThemeStore();
  const { subscribe } = usePostIndicatorStore();
  const i18nC = useTranslation("common");

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [type, daysInterval]);

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
  ]);

  const onRefetch = useCallback(() => {
    if (isRefetching) return;

    setIsRefetching(true);

    feed?.refetch?.()?.finally(() => {
      setIsRefetching(false);
    });
  }, [feed.refetch, isRefetching]);

  useEffect(() => {
    if (!updateFeedAfterPost) {
      return;
    }

    const unsubscribe = subscribe((isProcessing) => {
      if (!isProcessing) {
        onRefetch();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, updateFeedAfterPost]);

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
                {i18nC.t("There are no posts yet.")}
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
      refreshing={isRefetching}
      onRefresh={onRefetch}
      progressViewOffset={50}
      tintColor={isDarkMode ? "#fff" : "#000"}
      colors={isDarkMode ? ["#fff"] : ["#000"]}
      progressBackgroundColor={isDarkMode ? "#000" : "#fff"}
    />,
    onEndReachedThreshold: 0.5,
    onEndReached,
    ...(restProps as any),
  }), [
    width,
    feedList,
    restProps,
    isRefetching,
    searchKeyword,
    contentContainerStyle,
    onScroll,
    onRefetch,
  ]);
};
