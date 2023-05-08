import React from "react";
import { useTranslation } from "react-i18next";

import { useNoteLikeCount } from "@crossbell/react-account";
import { Edit, Reply, ShieldCheck, ThumbsUp } from "@tamagui/lucide-icons";
import type { ListResponse, NoteEntity } from "crossbell.js";
import type { ListItemProps } from "tamagui";
import { Text, XStack, YStack, Stack, Spacer, ListItemTitle, ListItem } from "tamagui";

import { useDate } from "@/hooks/use-date";

import { Avatar } from "../Avatar";
import { Titles } from "../Titles";

export interface CommentItemProps extends ListItemProps {
  comment: Comment
}

export type Comment = NoteEntity & {
  fromNotes: ListResponse<NoteEntity>
};

export const CommentItem: React.FC<CommentItemProps> = (props) => {
  const { comment, ...restProps } = props;
  const date = useDate();
  const i18n = useTranslation();

  const likeCount = useNoteLikeCount({
    characterId: comment.characterId,
    noteId: comment.noteId,
  }).data;

  return (
    <YStack width="100%">
      <ListItem
        alignItems="center"
        icon={<Avatar size={40} uri={comment?.character?.metadata?.content?.avatars?.[0]} />}
        title={(
          <ListItemTitle>
            {comment?.character?.metadata?.content?.name}
            <Spacer size={2} />
            <Titles characterId={comment.characterId} />
            {" · "}
            {i18n.t("ago", {
              time: date.dayjs
                .duration(
                  date.dayjs(comment?.createdAt).diff(date.dayjs(), "minute"),
                  "minute",
                )
                .humanize(),
            })}
            {" · "}
            <Stack marginBottom={"$-0.5"}>
              <ShieldCheck color="green" size={"$1"} />
            </Stack>
          </ListItemTitle>
        )}
        subTitle={comment?.metadata?.content?.content}
        {...restProps}
      />
      <XStack justifyContent="flex-end" gap="$2.5">
        <XStack alignItems="center" gap="$1.5" minWidth={"$3"} justifyContent="center">
          <ThumbsUp width={16} />
          <Text color={"$color"}>
            {likeCount || 0}
          </Text>
        </XStack>
        <XStack alignItems="center" gap="$1.5" minWidth={"$3"}justifyContent="center">
          <Reply width={16} />
          <Text color={"$color"}>
            {(comment as any)?.fromNotes?.count || 0}
          </Text>
        </XStack>
        <XStack alignItems="center" gap="$1.5" minWidth={"$3"}justifyContent="center">
          <Edit width={16} />
        </XStack>
      </XStack>
    </YStack>
  );
};
