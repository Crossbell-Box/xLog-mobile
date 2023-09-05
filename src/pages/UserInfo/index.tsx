import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Route } from "@showtime-xyz/tab-view";
import { TabView } from "@showtime-xyz/tab-view";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Spinner, Stack, Text, XStack } from "tamagui";

import { TabMasonryFeedList } from "@/components/FeedList";
import { PolarLightBackground } from "@/components/PolarLightBackground";
import { useCharacterId } from "@/hooks/use-character-id";
import { useRootNavigation } from "@/hooks/use-navigation";
import { getPage } from "@/models/page.model";
import type { RootStackParamList } from "@/navigation/types";
import { useGetSite } from "@/queries/site";
import type { ExpandedNote } from "@/types/crossbell";

import { Header } from "./Header";

const HomeScene: FC<{ characterId: number; index: number }> = ({ characterId, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        type={"character"}
      />
    </Stack>
  );
};

const TagScene: FC<{
  characterId: number
  index: number
  tag: string
}> = ({ characterId, tag, index }) => {
  return (
    <Stack flex={1}>
      <TabMasonryFeedList
        index={index}
        characterId={characterId}
        type={"tag"}
        tag={tag}
      />
    </Stack>
  );
};

const internalPages = [
  "/", // 首页
  "/archives", // 归档页面
  "/tag", // 标签页面
  "/nft", // NFT 展示页面
];

const disabledPages = [
  "/archives", // 归档页面
  "/tag", // 标签页面
  "/nft", // NFT 展示页面
];

type TabBarProps = Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0];

interface TabBarItemProps extends TabBarProps {
  isActive: boolean
  characterId: number
  link: Route
  onPressTab: (key: string) => void
}

function internalLink(link: Route) {
  if (link.key === "/") return {
    isInternal: true,
    slug: undefined,
    pagePath: "/",
  };

  const slug = link.key.split("/")[2];
  const pagePath = `/${link.key.split("/")[1]}`;
  return {
    isInternal: !!internalPages.find(p => p === pagePath && pagePath !== "/"),
    slug,
    pagePath,
  };
}

export const TabItem: FC<TabBarItemProps> = (props) => {
  const { isActive, characterId, link, jumpTo, onPressTab } = props;
  const i18n = useTranslation();
  const [note, setNote] = useState<ExpandedNote | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const internalTab = internalLink(link);
  const navigation = useRootNavigation();

  useEffect(() => {
    if (!internalTab.isInternal) {
      setLoading(true);
      const slug = link.key.split("/")[1];
      getPage({ slug, characterId }).then((r) => {
        r && setNote(r);
      }).finally(() => setLoading(false));
    }
  }, [internalTab, characterId, link]);

  const onPress = () => {
    if (internalTab.isInternal) {
      jumpTo(link.key);
      onPressTab(link.key);
    }
    else if (note.noteId) {
      navigation.navigate(
        "PostDetails",
        {
          characterId,
          note,
        },
      );
    }
  };

  if (link.key !== "/" && disabledPages.find(p => p.startsWith(link.key))) return null;

  return (
    <Stack onPress={onPress} key={link.key} paddingBottom="$2">
      {
        loading
          ? <Spinner size="small" />
          : <Text color={isActive ? "$color" : "#BEBEBE"}>{i18n.t(link.title)}</Text>
      }

      {
        isActive && (
          <Stack height={2} width={"100%"} marginTop="$1">
            <LinearGradient
              colors={["#30a19b", "#2875bf"]}
              style={{ position: "absolute", width: "100%", top: 0, bottom: 0 }}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
          </Stack>
        )
      }
    </Stack>
  );
};

export interface Props {
  characterId: number
}

const UserInfoPage: FC<NativeStackScreenProps<RootStackParamList, "UserInfo"> & { displayHeader?: boolean }> = (props) => {
  const { route, displayHeader } = props;
  const characterId = route?.params?.characterId;
  const character = useCharacter(characterId);
  const { top } = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const animationHeaderPosition = useSharedValue(0);
  const site = useGetSite(character.data?.handle);
  const routes = useMemo<Route[]>(() => {
    const links
      = site.data?.metadata?.content?.navigation?.find(nav => nav.url === "/")
        ? site.data?.metadata?.content?.navigation
        : [
          { label: "Home", url: "/" },
          ...(site.data?.metadata?.content?.navigation || []),
        ];
    return links.map((link, index) => ({ key: link.url, title: link.label, index }));
  }, [
    site.data?.metadata?.content?.navigation,
  ]);

  const renderScene = useCallback(({ route }: { route: Route }) => {
    const { slug, pagePath } = internalLink(route);

    if (pagePath === "/tag") {
      return <TagScene tag={slug} characterId={characterId} index={0} />;
    }

    if (pagePath === "/") {
      return <HomeScene characterId={characterId} index={0} />;
    }

    return null;
  }, [characterId]);

  const [currentTabKey, setCurrentTabKey] = useState(routes[0]?.key);

  const renderTabBar = (props: Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0]) => {
    return (
      <ScrollView
        borderTopLeftRadius={"$6"}
        borderTopRightRadius={"$6"}
        horizontal
        paddingTop={"$3"}
        marginBottom={"$1"}
        paddingHorizontal="$3"
        backgroundColor={"#1F1E20"}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        <XStack gap={"$3"} paddingTop={"$2"}>
          {
            props.navigationState.routes.map((link: Route) => {
              const isActive = currentTabKey === link.key;
              return (
                <TabItem
                  key={link.key}
                  {...props}
                  isActive={isActive}
                  onPressTab={setCurrentTabKey}
                  characterId={characterId}
                  link={link}
                />
              );
            })
          }
        </XStack>
      </ScrollView>
    );
  };

  const renderHeader = () => (
    <Stack paddingHorizontal="$3" paddingTop={top} backgroundColor={"$background"}>
      <PolarLightBackground activeIndex={0}/>
      <Header characterId={characterId} titleAnimatedValue={displayHeader ? animationHeaderPosition : undefined} />
    </Stack>
  );

  return (
    <Stack flex={1}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={renderTabBar}
        lazy
        renderScrollHeader={renderHeader}
        minHeaderHeight={top}
        animationHeaderPosition={animationHeaderPosition}
        swipeEnabled={false}
        style={{ backgroundColor: "#1F1E20" }}
      />
      {/* TODO */}
      <Stack position="absolute" top={0} bottom={0} left={0} width={2}/>
    </Stack>
  );
};

export const OthersUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => <UserInfoPage {...props} displayHeader />;
export const MyUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => {
  const characterId = useCharacterId();

  useEffect(() => {
    props.navigation.setParams({ characterId });
  }, [characterId]);

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><UserInfoPage {...props} /></SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
