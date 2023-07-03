import type { FC } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Card, Paragraph, SizableText, Stack, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Loading } from "@/components/Loading";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { useDate } from "@/hooks/use-date";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPagesBySite } from "@/queries/page";
import { useGetSite } from "@/queries/site";

export interface Props {
}

export const EventsPage: FC<NativeStackScreenProps<RootStackParamList, "Events">> = () => {
  const pages = useGetPagesBySite({
    type: "post",
    characterId: 50153,
    limit: 100,
  });
  const date = useDate();
  const navigation = useRootNavigation();
  const i18n = useTranslation("dashboard");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title={i18n.t("Events")} description={null} />
      <Loading isLoading={pages.isLoading} >
        <ScrollView style={{ paddingHorizontal: 12 }}>
          {pages.data?.pages[0]?.list.map((item) => {
            let status: "Ended" | "Upcoming" | "Ongoing" = "Ended";
            if (item.metadata?.content?.frontMatter?.EndTime < new Date()) {
              status = "Ended";
            }
            else if (
              item.metadata?.content?.frontMatter?.StartTime > new Date()
            ) {
              status = "Upcoming";
            }
            else {
              status = "Ongoing";
            }

            return (
              <Card key={item.transactionHash} elevate size="$4" bordered marginBottom="$4">
                <Card.Header padded>
                  <Stack
                    borderRadius={20}
                    backgroundColor={{
                      Upcoming: "#22c55e",
                      Ongoing: "#EAB308",
                      Ended: "#6B7280",
                    }[status]}
                    paddingHorizontal="$2"
                    paddingVertical="$1.5"
                    alignSelf="flex-start"
                    marginBottom="$2"
                  >
                    <Text color={"white"}>{i18n.t(status)}</Text>
                  </Stack>
                  <SizableText marginBottom="$2" lineHeight={"$4"} numberOfLines={2} color={"$color"} fontWeight="700">{item.metadata?.content?.title}</SizableText>
                  <YStack gap="$2">
                    <Paragraph color={"$colorSubtitle"} size="$4">
                      <Text fontWeight={"700"}>{i18n.t("Date")}:</Text>&nbsp;
                      {date.formatDate(
                        item.metadata?.content?.frontMatter?.StartTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}&nbsp;
                      -&nbsp;
                      {date.formatDate(
                        item.metadata?.content?.frontMatter?.EndTime,
                        "lll",
                        isMounted ? undefined : "America/Los_Angeles",
                      )}
                    </Paragraph>
                    <Paragraph color={"$colorSubtitle"} size="$4">
                      <Text fontWeight={"700"}>{i18n.t("Prize")}:</Text>&nbsp;
                      {item.metadata?.content?.frontMatter?.Prize}
                    </Paragraph>
                    {item.metadata?.content?.frontMatter?.Winners?.map && (
                      <YStack gap="$2">
                        <Text color={"$colorSubtitle"} fontWeight={"700"}>{i18n.t("Winners")}:</Text>
                        <XStack gap="$2" flexWrap="wrap">
                          {item.metadata?.content?.frontMatter?.Winners?.map?.(
                            (winner, index) => (
                              <SiteAvatar key={index} siteId={winner} />
                            ),
                          )}
                        </XStack>
                      </YStack>
                    )}
                  </YStack>
                </Card.Header>
                <Card.Footer padded>
                  <XStack flex={1} />
                  <Button bordered radiused onPress={() => {
                    navigation.navigate("Web", {
                      url: item.metadata?.content?.frontMatter?.ExtraLink
                        || `/api/redirection?characterId=${item.characterId}&noteId=${item.noteId}`,
                    });
                  }} borderRadius="$10">{i18n.t("Learn more")}</Button>
                </Card.Footer>
                <Card.Background>
                </Card.Background>
              </Card>
            );
          })}
        </ScrollView>
      </Loading>
    </ProfilePageLayout>
  );
};

function SiteAvatar({ siteId }: { siteId: string }) {
  const site = useGetSite(siteId);

  return (
    <Avatar
      character={site.data}
      size={40}
    />
  );
}
