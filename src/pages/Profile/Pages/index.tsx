import React from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Newspaper } from "@tamagui/lucide-icons";
import { ListItem, Separator, SizableText, Tabs, Text, ListItemSubtitle, YGroup, Spinner, Stack } from "tamagui";

import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { useDate } from "@/hooks/use-date";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPagesBySite } from "@/queries/page";
import { PageVisibilityEnum } from "@/types";
import { getPageVisibility } from "@/utils/page-helpers";

export interface Props {
}

const tabs = [
  {
    value: PageVisibilityEnum.All,
    text: "All Pages",
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

export const PagesPage: FC<NativeStackScreenProps<RootStackParamList, "Pages">> = () => {
  const { computed } = useAccountState();
  const i18n = useTranslation();
  const [selectedTab, setSelectedTab] = React.useState<PageVisibilityEnum>(tabs[0].value);
  const handle = computed?.account?.character?.handle;
  const characterId = computed?.account?.characterId;
  const date = useDate();

  const pages = useGetPagesBySite({
    type: "page",
    characterId,
    limit: 100,
    visibility: selectedTab,
    handle,
  });

  return (
    <ProfilePageLayout>
      <ProfilePageHeader
        title="页面"
        description={(
          <Text>
            页面是静态的，不受日期影响。它们更像是你网站上的永久元素，比如&ldquo;关于我们&rdquo;、&ldquo;联系我们&rdquo;等。文章与页面。
            创建页面后，你可以将其添加到你网站的导航菜单电，以便访问者可以找到它。
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
                  <SizableText size="$4" color={activeColor}>
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
    </ProfilePageLayout>
  );
};
