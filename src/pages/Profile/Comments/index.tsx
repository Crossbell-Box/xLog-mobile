import React from "react";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FlatList } from "react-native-gesture-handler";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Separator, SizableText, Spinner, Stack, Text } from "tamagui";

import { CommentItem } from "@/components/CommentItem";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import type { RootStackParamList } from "@/navigation/types";
import { useGetCommentsBySite } from "@/queries/site";

export interface Props {}

export const CommentsPage: FC<NativeStackScreenProps<RootStackParamList, "Comments">> = () => {
  const { computed: { account: { characterId } } } = useAccountState();
  const comments = useGetCommentsBySite({ characterId });
  const i18n = useTranslation();

  const flatedComments = comments.data?.pages?.flatMap((page) => {
    return page?.list || [];
  });

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title="评论" description={null} />
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ width: "100%", alignSelf: "center" }}
        data={flatedComments}
        ItemSeparatorComponent={() => <Separator marginBottom="$3" />}
        scrollIndicatorInsets={{
          right: -16,
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
        ListFooterComponent={comments.isFetchingNextPage && <Spinner paddingBottom="$5"/>}
        keyExtractor={item => item.transactionHash}
        renderItem={({ item }) => {
          const type = item.toNote?.metadata?.content?.tags?.[0];
          let toTitle: string;
          if (type === "post" || type === "page") {
            toTitle = item.toNote?.metadata?.content?.title;
          }
          else {
            if (
              (item.toNote?.metadata?.content?.content?.length
                || 0) > 30
            ) {
              toTitle
                = `${item.toNote?.metadata?.content?.content?.slice(
                  0,
                  30,
                )}...`;
            }
            else {
              toTitle = item.toNote?.metadata?.content?.content;
            }
          }
          const name
            = item?.character?.metadata?.content?.name
            || `@${item?.character?.handle}`;

          return (
            <>
              <SizableText color="$color" size={"$4"} marginBottom="$3">
                {name}&nbsp;
                <Trans
                  i18nKey="comment on your"
                  values={{
                    type: i18n.t(type || "", {
                      ns: "common",
                    }),
                    toTitle,
                  }}
                  defaults="commented on your {{type}} <Text>{{toTitle}}</Text>"
                  components={{
                    Text: (
                      <Text color={"$primary"}>
                        .
                      </Text>
                    ),
                  }}
                />
                :
              </SizableText>
              <CommentItem
                commentable
                comment={item}
                padding={0}
                paddingVertical="$2"
                displayReply={false}
              />
            </>
          );
        }}
      />
    </ProfilePageLayout>
  );
};
