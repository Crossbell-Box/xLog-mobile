import type { FC } from "react";
import { useMemo } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import type { useAnimatedScrollHandler } from "react-native-reanimated";

import type { NoteEntity } from "crossbell";
import * as Haptics from "expo-haptics";
import { Separator, Spinner, Stack, useWindowDimensions } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import type { FeedType } from "@/models/home.model";
import { useGetFeed } from "@/queries/home";

import { FeedListItem } from "./FeedListItem";

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
}

export const FeedList: FC<Props> = (props) => {
  const { type, noteIds, daysInterval = 7, onScroll, onScrollEndDrag } = props;
  const { width, height } = useWindowDimensions();
  const characterId = useCharacterId();
  const feed = useGetFeed({
    type,
    limit: 10,
    characterId,
    noteIds,
    daysInterval,
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
        keyExtractor={(post, index) => `${type}-${post.noteId}-${index}`}
        renderItem={({ item, index }) => (
          <FeedListItem key={index} note={item}/>
        )}
        ListFooterComponent={feed.isFetchingNextPage && <Spinner paddingBottom="$5"/>}
        ItemSeparatorComponent={() => <Separator borderColor={"$gray5"}/>}
        estimatedItemSize={238}
        bounces
        estimatedListSize={{
          height: height * 0.8,
          width,
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

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          feed?.fetchNextPage?.();
        }}
      />
    </Stack>
  );
};
