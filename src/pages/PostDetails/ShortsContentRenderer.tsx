import type { FC } from "react";
import { useTranslation } from "react-i18next";

import type { NoteEntity } from "crossbell";
import { Separator, Stack, Text, YStack } from "tamagui";

import { Button } from "@/components/Base/Button";
import { CommentItem } from "@/components/CommentItem";
import { EmptyComponent } from "@/components/CommentList";
import { useGetComments } from "@/queries/page";

export const ShortsContentRenderer: FC<{
  note: NoteEntity
  onPressComment: () => void
  onPressViewAllComments: () => void
}> = ({ note, onPressComment, onPressViewAllComments }) => {
  const { noteId, characterId } = note;
  const comments = useGetComments({ characterId, noteId });
  const content = note?.metadata?.content?.content;
  const commentsCount = comments.data?.pages?.[0]?.count || 0;
  const data = comments.data?.pages.flatMap(page =>
    (page?.list || []).map(data => data),
  );
  const i18n = useTranslation("common");

  return (
    <Stack paddingHorizontal="$2" paddingBottom="$10">
      <Text lineHeight={"$2"} fontSize={"$5"} color={"$colorText"}>{content}</Text>
      {content && <Separator marginVertical="$4" height={2}/>}
      <Text fontSize={"$3"} color="$colorDescription">
        {i18n.t("{{count}} comments", {
          count: commentsCount,
        })}
      </Text>
      {
        commentsCount === 0
          ? (
            <EmptyComponent
              creationTipsShown
              onPressCreationTips={onPressComment}
              isLoading={false}
            />
          )
          : (
            <YStack marginTop="$4" gap="$2">
              {
                data.slice(0, 2).map((comment) => {
                  return (
                    <CommentItem
                      key={comment.blockNumber.toString()}
                      editable={false}
                      commentable={false}
                      likeable={false}
                      comment={comment}
                      displayReply={false}
                    />
                  );
                })
              }
              {data.length >= 2
                ? (
                  <Button type="primary" onPress={onPressViewAllComments}>
                    {i18n.t("View all {{count}} comments", {
                      count: commentsCount,
                    })}
                  </Button>
                )
                : (
                  <Button type="primary" onPress={onPressComment}>
                    {i18n.t("Add a comment")}
                  </Button>
                )}
            </YStack>
          )
      }
    </Stack>
  );
};
