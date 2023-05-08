import React from "react";
import type { FC } from "react";
import { ScrollView } from "react-native";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Newspaper } from "@tamagui/lucide-icons";
import { ListItem, Separator, SizableText, Tabs, Text, YStack, ListItemSubtitle, YGroup, Spinner, Stack } from "tamagui";

import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { useDate } from "@/hooks/use-date";
import { i18n } from "@/i18n";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPagesBySite } from "@/queries/page";
import { PageVisibilityEnum } from "@/types";
import { getPageVisibility } from "@/utils/page-helpers";

export interface Props {
}

const tabs = [
  {
    value: PageVisibilityEnum.All,
    text: "All Posts",
  },
  {
    value: PageVisibilityEnum.Published,
    text: "Published",
  },
  {
    value: PageVisibilityEnum.Draft,
    text: "Draft",
  },
  {
    value: PageVisibilityEnum.Scheduled,
    text: "Scheduled",
  },
];

export const PostsPage: FC<NativeStackScreenProps<RootStackParamList, "Posts">> = () => {
  const { computed } = useAccountState();

  const [selectedTab, setSelectedTab] = React.useState<PageVisibilityEnum>(tabs[0].value);
  const handle = computed?.account?.character?.handle;
  const characterId = computed?.account?.characterId;
  const date = useDate();

  const pages = useGetPagesBySite({
    type: "post",
    characterId,
    limit: 100,
    visibility: selectedTab,
    handle,
  });

  return (
    <YStack padding="$3" flex={1}>
      <ProfilePageHeader
        title="文章"
        description={(
          <Text>
            文章是按时间倒序在你的网站上列出的条目。可以将它们看作是更新，以提供新内容给读者。
          </Text>
        )} />
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        borderRadius="$4"
        overflow="hidden"
      >
        <Tabs.List
          separator={<Separator vertical />}
          disablePassBorderRadius="bottom"
          aria-label="Manage your account"
        >
          {
            tabs.map((tab) => {
              const isActive = selectedTab === tab.value;
              const activeBg = isActive ? "$backgroundFocus" : "$background";
              const activeColor = isActive ? "$color" : "$colorFocus";
              return (
                <Tabs.Tab padding={0} onPress={() => setSelectedTab(tab.value)} key={tab.value} flex={1} value="tab1" backgroundColor={activeBg}>
                  <SizableText size="$sm" color={activeColor}>
                    {i18n.t(tab.text)}
                  </SizableText>
                </Tabs.Tab>
              );
            })
          }
        </Tabs.List>
        <Separator />
        {
          pages?.isLoading
            ? (
              <Stack flex={1} alignItems="center" justifyContent="center">
                <Spinner/>
              </Stack>
            )
            : (
              <ScrollView>
                <YGroup alignSelf="center" size="$4" flex={1}>
                  {
                    pages?.data?.pages.map((page) => {
                      return page?.list.map((item) => {
                        return (
                          <YGroup.Item key={item.blockNumber}>
                            <ListItem
                              hoverTheme
                              icon={Newspaper}
                              title={item?.metadata?.content?.title}
                              subTitle={(
                                <ListItemSubtitle>
                                  已发布 · {
                                    getPageVisibility(item) === PageVisibilityEnum.Draft
                                      ? date.formatDate(item.updatedAt)
                                      : date.formatDate(
                                        item.metadata?.content?.date_published || "",
                                      )
                                  }</ListItemSubtitle>
                              )}
                            />
                          </YGroup.Item>
                        );
                      });
                    })
                  }
                </YGroup>
              </ScrollView>
            )}
      </Tabs>
    </YStack>
  );
};