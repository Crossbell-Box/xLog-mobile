import type { FC } from "react";
import { useTranslation } from "react-i18next";

import { Separator, Stack, Text } from "tamagui";

import { EmptyComponent } from "@/components/CommentList";
import { useGetComments } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";

export const ShortsContentRenderer: FC<{
  note: ExpandedNote
  onPressComment: () => void
}> = ({ note, onPressComment }) => {
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
      <Text fontSize={"$5"} color={"$colorText"}>{content}</Text>
      <Separator marginVertical="$4" height={2}/>
      <Text fontSize={"$3"} color="$colorDescription">
        {i18n.t("{{count}} comments", {
          count: commentsCount,
        })}
      </Text>
      {commentsCount === 0 && (
        <EmptyComponent
          creationTipsShown
          onPressCreationTips={onPressComment}
          isLoading={comments.isFetching}
        />
      )}
    </Stack>
  );
};
