import type { FC } from "react";
import { useMemo } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import type { NoteEntity } from "crossbell.js";
import * as Haptics from "expo-haptics";
import { Spinner, Stack } from "tamagui";

import { useComposedScrollHandler } from "@/hooks/useComposedScrollHandler";
import type { FeedType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";

import { FeedListItem } from "./FeedListItem";

import { ReanimatedFlashList } from "../ReanimatedFlashList";

export interface Props {
  onScroll?: ReturnType<typeof useAnimatedScrollHandler>
  onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  type?: FeedType
  noteIds?: string[]
}

export const FeedList: FC<Props> = (props) => {
  const { type, noteIds } = props;
  const onScrollHandler = useComposedScrollHandler([props.onScroll]);
  const feed = useGetFeed({
    type,
    limit: 10,
    characterId: undefined, // TODO
    noteIds,
    daysInterval: 7, // TODO
  });

  const feedList = useMemo<NoteEntity[]>(() => {
    return feed.data?.pages?.reduce((acc, page) => [...acc, ...(page?.list || [])], []) ?? [];
  }, [feed.data]);

  if (feed.isLoading) {
    return (
      <Stack justifyContent="center" alignItems="center" flex={1}>
        <Spinner />
      </Stack>
    );
  }

  return (
    <Stack flex={1}>
      <ReanimatedFlashList<NoteEntity>
        data={feedList}
        keyExtractor={(post, index) => `${post.characterId}-${post.noteId}-${index}`}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => {
          return (
            <Stack key={index} marginBottom={"$5"} >
              <FeedListItem note={item} />
            </Stack>
          );
        }}
        estimatedItemSize={238}
        bounces
        scrollEventThrottle={16}
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={props.onScrollEndDrag}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (
            feedList.length === 0
            || feed.isFetching
            || feed.isFetchingNextPage
            || feed.isFetchingPreviousPage
            || feed.hasNextPage === false
          )
            return;

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          feed?.fetchNextPage?.();
        }}
        ListFooterComponent={() => {
          if (feed.isFetchingNextPage)
            return <Spinner />;

          return null;
        }}
      />
    </Stack>
  );
};
