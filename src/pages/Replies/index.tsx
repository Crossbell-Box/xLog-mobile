import type { FC } from "react";
import React from "react";
import { FlatList } from "react-native-gesture-handler";
import Animated, { FadeInRight, FlipInXDown, FlipInXUp, SlideInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { H5, Spinner, Stack, YStack } from "tamagui";

import { CommentItem, type Comment } from "@/components/CommentItem";
import { WithSpinner } from "@/components/WithSpinner";
import { useMounted } from "@/hooks/use-mounted";
import type { RootStackParamList } from "@/navigation/types";
import { useGetComment, useGetComments } from "@/queries/page";
import { flatComments } from "@/utils/flat-comments";

export interface Props {
  comment: Comment
  depth: number
}

export const RepliesPage: FC<NativeStackScreenProps<RootStackParamList, "Replies">> = (props) => {
  const { bottom } = useSafeAreaInsets();
  const { comment, depth } = props.route.params;
  const mounted = useMounted();
  const comments = useGetComments({ characterId: comment.characterId, noteId: comment.noteId, limit: 10 });
  const repliesCount = comments.data?.pages?.[0]?.count;
  const flattedComments = comments.data?.pages?.flatMap((page) => {
    return page?.list?.flatMap(comment => flatComments(comment, depth)) || [];
  }) || [];

  const refetch = comments.refetch;

  return (
    <Stack flex={1} backgroundColor={"$background"}>
      <Stack paddingHorizontal={16} flex={1}>
        <FlatList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingTop: 16 * 2,
            paddingBottom: bottom + 16,
          }}
          data={flattedComments}
          ListHeaderComponent={() => {
            return (
              <YStack backgroundColor={"$background"}>
                <YStack borderBottomColor={"$backgroundHover"} borderBottomWidth={3} paddingBottom="$2" marginBottom="$3">
                  <CommentItem
                    commentable
                    padding={0}
                    comment={comment}
                    onComment={refetch}
                    onEdit={refetch}
                  />
                </YStack>
                <H5 marginBottom="$3">回复&nbsp;{repliesCount}</H5>
              </YStack>
            );
          }}
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
              <Animated.View entering={mounted.current && FadeInRight}>
                <CommentItem
                  editable
                  commentable
                  key={item?.data?.blockNumber?.toString()}
                  padding={0}
                  toCharacterId={item?.data?.toCharacterId}
                  comment={item?.data}
                  depth={item?.depth}
                  onComment={refetch}
                  onEdit={refetch}
                />
              </Animated.View>
            );
          }}
        />
      </Stack>
    </Stack>
  );
};
