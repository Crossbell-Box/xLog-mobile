import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { ArrowRight, Edit } from "@tamagui/lucide-icons";
import type { CharacterEntity, ListResponse, NoteEntity } from "crossbell";
import type { ListItemProps } from "tamagui";
import { Text, XStack, YStack, Stack, Spacer, Paragraph, Button } from "tamagui";

import { useDate } from "@/hooks/use-date";

import { Avatar } from "../Avatar";
import { BlockchainInfoIcon } from "../BlockchainInfoIcon";
import { ReactionLike } from "../ReactionLike";
import { Titles } from "../Titles";

export interface CommentItemProps extends ListItemProps {
  comment: Comment
  fromComment?: Comment
  displayReply?: boolean
  displayMore?: boolean
  depth?: number
  onPressMore?: () => void
  onPressComment?: (comment: Comment) => void
}

export type Comment = NoteEntity & {
  fromNotes: ListResponse<NoteEntity>
};

export const CommentItem: React.FC<CommentItemProps> = (props) => {
  const {
    comment, fromComment, displayMore = false, displayReply = false, depth = 0,
    onPressMore, onPressComment: _onPressComment,
    ...restProps
  } = props;
  const date = useDate();
  const i18n = useTranslation();

  const isSubComment = depth > 0;
  const repliesCount = (comment as any)?.fromNotes?.list?.length || 0;
  const hasReply = repliesCount > 0;

  const onPressComment = React.useCallback(() => {
    _onPressComment?.(comment);
  }, [_onPressComment, comment]);

  return (
    <XStack marginBottom="$2" gap="$3" {...restProps}>
      <Avatar size={isSubComment ? 36 : 40} character={comment?.character} />
      <YStack flex={1}>
        <YStack flex={1}>
          <XStack alignItems="center" marginBottom="$1">
            <Text fontWeight={isSubComment ? "400" : "700"} maxWidth={"40%"} numberOfLines={1}>
              {comment?.character?.metadata?.content?.name}
            </Text>
            <Spacer size={2} />
            <Titles characterId={comment.characterId} />

            {
              fromComment && (
                <>
                  <Spacer size={4} />
                  <ArrowRight size={"$0.5"} color="$primary"/>
                  <Spacer size={4} />

                  <Text fontWeight={"400"} maxWidth={"40%"} numberOfLines={1}>
                    {fromComment?.character?.metadata?.content?.name}
                  </Text>
                  <Spacer size={2} />
                  <Titles characterId={fromComment.characterId} />
                </>
              )
            }
          </XStack>

          <Paragraph size={"$4"}>
            {comment?.metadata?.content?.content}
          </Paragraph>
          <XStack alignItems="center">
            <Text color={"$colorSubtitle"}>
              {i18n.t("ago", {
                time: date.dayjs
                  .duration(
                    date.dayjs(comment?.createdAt).diff(date.dayjs(), "minute"),
                    "minute",
                  )
                  .humanize(),
              })}
              {" · "}
            </Text>
            <Stack height={22} alignItems="center">
              <BlockchainInfoIcon size={16} character={comment?.character} page={comment.toNote}/>
            </Stack>
          </XStack>
        </YStack>

        <XStack justifyContent="flex-end" gap="$3" marginTop="$2" alignItems="center">
          <ReactionLike iconSize={"$0.75"} fontSize={"$4"} characterId={comment.characterId} noteId={comment.noteId}/>
          <TouchableWithoutFeedback onPress={onPressComment}>
            <XStack alignItems="center" gap="$1.5" minWidth={"$3"}justifyContent="center">
              <Text color={"$color"} fontSize={"$4"}>
            回复&nbsp;
                {(comment as any)?.fromNotes?.count || 0}
              </Text>
            </XStack>
          </TouchableWithoutFeedback>
          <XStack alignItems="center" gap="$1.5" minWidth={"$3"} justifyContent="center">
            <Edit size={"$0.75"} fontSize={"$4"}/>
            <Text color={"$color"} fontSize={"$4"}>
            &nbsp;编辑
            </Text>
          </XStack>
        </XStack>

        {
          displayReply && hasReply && (
            <Stack marginTop="$3">
              {
                (comment as any)?.fromNotes?.list?.slice(0, 2)?.map(
                  (
                    subcomment: NoteEntity & {
                      character?: CharacterEntity | null
                      fromNotes: ListResponse<NoteEntity>
                    },
                  ) => {
                    return (
                      <Stack key={subcomment.blockNumber} marginBottom="$2">
                        <CommentItem
                          fromComment={comment}
                          comment={subcomment as Comment}
                          onPressComment={_onPressComment}
                          displayReply={false}
                          depth={depth + 1}
                        />
                      </Stack>
                    );
                  },
                )
              }
            </Stack>
          )
        }

        {
          displayMore && (
            <Button onPress={onPressMore} marginBottom="$4">
              <Text>
                查看全部{repliesCount}条回复
              </Text>
            </Button>
          )
        }
      </YStack>
    </XStack>
  );
};
