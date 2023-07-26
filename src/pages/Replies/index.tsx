import type { FC } from "react";
import React, { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { H5, Spinner, Stack, YStack } from "tamagui";

import { CommentItem, type Comment } from "@/components/CommentItem";
import type { RootStackParamList } from "@/navigation/types";
import { useGetComments } from "@/queries/page";
import { flatComments } from "@/utils/flat-comments";

export interface Props {
  comment: Comment
  depth: number
}

export const RepliesPage: FC<NativeStackScreenProps<RootStackParamList, "Replies">> = (props) => {
  const { bottom } = useSafeAreaInsets();
  const { comment, depth } = props.route.params;
  const comments = useGetComments({ characterId: comment.characterId, noteId: comment.noteId, limit: 10 });
  const flattedComments = useMemo(() => comments.data?.pages?.flatMap((page) => {
    return page?.list?.flatMap(comment => flatComments(comment, depth)) || [];
  }) || [], [
    comments.data?.pages,
    depth,
  ]);

  const ListHeaderComponent = useMemo(() => {
    const repliesCount = comments.data?.pages?.[0]?.count;
    return (
      <YStack backgroundColor={"$background"}>
        <YStack borderBottomColor={"$backgroundHover"} borderBottomWidth={1} paddingBottom="$2" marginBottom="$3" paddingHorizontal={16}>
          <CommentItem
            editable
            commentable
            padding={0}
            comment={comment}
            depth={0}
            onComment={comments.refetch}
            onEdit={comments.refetch}
            originalNoteId={comment.noteId}
            originalCharacterId={comment.characterId}
          />
        </YStack>
        <H5 paddingHorizontal={16} marginBottom="$3">回复&nbsp;{repliesCount}</H5>
      </YStack>
    );
  }, [
    comment,
    comments,
  ]);

  return (
    <Stack flex={1} backgroundColor={"$background"}>
      <Stack flex={1}>
        <FlashList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingTop: 16 * 2,
            paddingBottom: bottom + 16,
          }}
          data={flattedComments}
          ListHeaderComponent={ListHeaderComponent}
          estimatedItemSize={100}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (
              comments.data?.pages.length === 0
                || comments.isFetchingNextPage
                || comments.hasNextPage === false
            )
              return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            comments?.fetchNextPage?.();
          }}
          ListFooterComponent={(comments.isFetchingNextPage || (comments.isFetching && flattedComments.length === 0)) && <Spinner paddingBottom="$5"/>}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item?.data?.blockNumber?.toString()}
          renderItem={({ item }) => {
            return (
              <Stack paddingHorizontal={16}>
                <CommentItem
                  editable
                  commentable
                  key={item?.data?.blockNumber?.toString()}
                  padding={0}
                  comment={item?.data}
                  depth={item?.depth}
                  onComment={comments.refetch}
                  onEdit={comments.refetch}
                  originalNoteId={comment.toNoteId}
                  originalCharacterId={comment.toCharacterId}
                />
              </Stack>
            );
          }}
        />
      </Stack>
    </Stack>
  );
};
