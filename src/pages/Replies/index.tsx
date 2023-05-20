import type { FC } from "react";
import React from "react";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { H5, Stack, YStack } from "tamagui";

import { CommentItem, type Comment } from "@/components/CommentItem";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
  comment: Comment
}

const flatComments = (comment: Comment, list: Array<{
  from: Comment
  to: Comment
}>): Array<{
  from: Comment
  to: Comment
}> => {
  if (comment.fromNotes?.list?.length) {
    list.push(
      ...comment.fromNotes.list.map((item: Comment) => {
        flatComments(item, list);

        return {
          from: item,
          to: comment,
        };
      }),
    );
  }
  else {
    return [];
  }

  return list;
};

export const RepliesPage: FC<NativeStackScreenProps<RootStackParamList, "Replies">> = (props) => {
  const { bottom } = useSafeAreaInsets();
  const { comment } = props.route.params;

  return (
    <Stack flex={1} backgroundColor={"$background"}>
      <Stack paddingHorizontal={16} flex={1}>
        <FlatList
          contentContainerStyle={{
            paddingTop: 16 * 2,
            paddingBottom: bottom + 16,
          }}
          data={flatComments(comment, []).sort((a, b) => b.from.createdAt > a.from.createdAt ? 1 : -1)}
          ListHeaderComponent={() => {
            return (
              <YStack backgroundColor={"$background"}>
                <YStack borderBottomColor={"$backgroundHover"} borderBottomWidth={3} paddingBottom="$2" marginBottom="$3">
                  <CommentItem padding={0} comment={comment} />
                </YStack>
                <H5 marginBottom="$3">回复&nbsp;11</H5>
              </YStack>
            );
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.from.blockNumber.toString()}
          renderItem={({ item }) => {
            return (
              <CommentItem
                key={item.from.blockNumber.toString()}
                padding={0}
                comment={item.from}
                fromComment={item.to}
              />
            );
          }}
        />
      </Stack>
    </Stack>
  );
};
