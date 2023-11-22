import React from "react";
import type { FC } from "react";
import { Trans, useTranslation } from "react-i18next";
import { ScrollView } from "react-native";

import { useAccountState } from "@crossbell/react-account";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Newspaper } from "@tamagui/lucide-icons";
import { ListItem, Separator, SizableText, Tabs, YGroup, Spinner, Stack } from "tamagui";

import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { useDate } from "@/hooks/use-date";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPagesBySiteLite } from "@/queries/page";
import { PageVisibilityEnum } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";
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
  const i18n = useTranslation("dashboard");
  const [selectedTab, setSelectedTab] = React.useState<PageVisibilityEnum>(tabs[0].value);
  const handle = computed?.account?.character?.handle;
  const characterId = computed?.account?.characterId;
  const date = useDate();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const pages = useGetPagesBySiteLite({
    type: "post",
    characterId,
    limit: 100,
    visibility: selectedTab,
    handle,
  });

  const toDetails = (characterId: number, note: ExpandedNote) => {
    navigation.navigate(
      "PostDetails",
      {
        characterId,
        note,
      },
    );
  };

  return (
    <ProfilePageLayout>
      <ProfilePageHeader
        title={i18n.t("Posts")}
        description={(
          <Trans i18nKey="posts description">
          Posts are entries listed in reverse chronological order on your site.
          Think of them as articles or updates that you share to offer up new
          content to your readers.
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
                              onPress={() => toDetails(item.characterId, item)}
                              subTitle={`已发布 · ${
                                getPageVisibility(item) === PageVisibilityEnum.Draft
                                  ? date.formatDate(item.updatedAt)
                                  : date.formatDate(
                                    item.metadata?.content?.date_published || "",
                                  )
                              }`}
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
