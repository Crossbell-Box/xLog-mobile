import React from "react";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Separator, SizableText, Text, YGroup } from "tamagui";

import { CommentItem } from "@/components/CommentItem";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import type { RootStackParamList } from "@/navigation/types";
import { useGetCommentsBySite } from "@/queries/site";

export interface Props {
}

export const CommentsPage: FC<NativeStackScreenProps<RootStackParamList, "Comments">> = () => {
  const { computed: { account: { characterId } } } = useAccountState();
  const comments = useGetCommentsBySite({ characterId });
  const i18n = useTranslation();

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title="评论" description={null} />
      <ScrollView style={styles.container}>
        <YGroup alignSelf="center" flex={1} size="$4" separator={<Separator marginVertical="$3" />}>
          {
            comments.data?.pages.map(page => (
              page?.list?.map((comment) => {
                const type = comment.toNote?.metadata?.content?.tags?.[0];
                let toTitle: string;
                if (type === "post" || type === "page") {
                  toTitle = comment.toNote?.metadata?.content?.title;
                }
                else {
                  if (
                    (comment.toNote?.metadata?.content?.content?.length
                      || 0) > 30
                  ) {
                    toTitle
                      = `${comment.toNote?.metadata?.content?.content?.slice(
                        0,
                        30,
                      )}...`;
                  }
                  else {
                    toTitle = comment.toNote?.metadata?.content?.content;
                  }
                }
                const name
                  = comment?.character?.metadata?.content?.name
                  || `@${comment?.character?.handle}`;

                return (
                  <YGroup.Item key={comment.transactionHash}>
                    <SizableText color="$color" size={"$sm"}>
                      {name}{" "}
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
                      comment={comment}
                      padding={0}
                      paddingVertical="$2"
                    />
                  </YGroup.Item>
                );
              })
            ))
          }
        </YGroup>
      </ScrollView>
    </ProfilePageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
