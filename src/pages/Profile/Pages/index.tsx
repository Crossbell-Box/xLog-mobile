import React from "react";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Newspaper } from "@tamagui/lucide-icons";
import { ListItem, Separator, SizableText, Tabs, ListItemSubtitle, YGroup, Spinner, Stack } from "tamagui";

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
        title={i18n.t("Pages")}
        description={(
          <Trans i18nKey="pages description">
          Pages are static and are not affected by date. Think of them as more
          permanent fixtures of your site — an About page, and a Contact page
          are great examples of this.
          </Trans>
        )} />
      <Tabs
        defaultValue="tab1"
        orientation="horizontal"
        flexDirection="column"
        flex={1}
        margin="$3"
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
