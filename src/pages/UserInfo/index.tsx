import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, StatusBar } from "react-native";
import type { Animated } from "react-native";
import type { Layout } from "react-native-reanimated";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Route } from "@showtime-xyz/tab-view";
import { TabFlatList, TabScrollView, TabView } from "@showtime-xyz/tab-view";
import * as Haptics from "expo-haptics";
import { ScrollView, Spinner, Stack, Text, XStack } from "tamagui";

import { DOMAIN } from "@/constants";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { RootStackParamList } from "@/navigation/types";
import { getIdBySlug, useGetPagesBySiteLite } from "@/queries/page";
import { useGetSite } from "@/queries/site";
import { PageVisibilityEnum } from "@/types";
import type { ExpandedNote } from "@/types/crossbell";

import { Header } from "./Header";
import { PostsListItem } from "./PostsListItem";

export interface SceneRendererProps {
  layout: Layout
  position: Animated.AnimatedInterpolation<number>
  jumpTo: (key: string) => void
}

const StatusBarHeight = StatusBar.currentHeight ?? 0;

const PageScene: FC<{ index: number }> = ({ index }) => {
  return (
    <Stack paddingHorizontal="$3" flex={1}>
      <TabScrollView index={index} />
    </Stack>
  );
};

const HomeScene: FC<{ characterId: number; index: number }> = ({ characterId, index }) => {
  const posts = useGetPagesBySiteLite({
    characterId,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    useStat: true,
  });

  const postsList = useMemo<ExpandedNote[]>(() => {
    return posts.data?.pages?.flatMap(posts => posts.list) ?? [];
  }, [posts.data]);

  return (
    <Stack flex={1}>
      <TabFlatList
        index={index}
        data={posts.data?.pages?.flatMap(posts => posts.list)}
        renderItem={({ item, index }) => <PostsListItem key={index} note={item} style={styles.itemContainer} />}
        keyExtractor={(post, index) => `${post?.noteId}-${index}`}
        bounces
        style={{ paddingHorizontal: 16 }}
        showsVerticalScrollIndicator
        scrollEventThrottle={16}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (
            postsList.length === 0
            || posts.isFetchingNextPage
            || posts.hasNextPage === false
          )
            return;

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          posts?.fetchNextPage?.();
        }}
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

export const TabItem: FC<TabBarItemProps> = (props) => {
  const { isActive, characterId, link, jumpTo, onPressTab } = props;
  const { i18n } = useTranslation();
  const [noteId, setNoteId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const isInternalTab = useMemo(() => link.key.startsWith("/") && internalPages.find(p => p.startsWith(link.key)), [link.key]);
  const navigation = useRootNavigation();

  useEffect(() => {
    if (!isInternalTab) {
      setLoading(true);
      const slug = link.key.split("/")[1];
      getIdBySlug(slug, characterId).then(r => setNoteId(r.noteId)).finally(() => setLoading(false));
    }
  }, [isInternalTab, characterId, link.key]);

  const onPress = () => {
    if (isInternalTab) {
      jumpTo(link.key);
      onPressTab(link.key);
    }
    else if (noteId) {
      navigation.navigate(
        "PostDetails",
        {
          characterId,
          noteId,
        },
      );
    }
  };

  if (link.key !== "/" && disabledPages.find(p => p.startsWith(link.key))) return null;

  return (
    <Stack onPress={onPress} key={link.key} borderBottomWidth={isActive ? 1 : 0} borderBottomColor={isActive ? "$primary" : undefined} paddingBottom="$2">
      {
        loading
          ? <Spinner size="small" />
          : <Text color={isActive ? "$primary" : "#BEBEBE"}>{i18n.t(link.title)}</Text>
      }
    </Stack>
  );
};

export interface Props {
  characterId: number
}

const UserInfoPage: FC<NativeStackScreenProps<RootStackParamList, "UserInfo">> = (props) => {
  const { characterId } = props.route.params;
  const character = useCharacter(characterId);
  const [index, setIndex] = useState(0);
  const animationHeaderPosition = useSharedValue(0);
  const animationHeaderHeight = useSharedValue(0);
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
    if (route.key === "/") {
      return <HomeScene characterId={characterId} index={0} />;
    }
    return null;
  }, [characterId]);

  const [currentTabKey, setCurrentTabKey] = useState(routes[0]?.key);

  const renderTabBar = (props: Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0]) => {
    return (
      <ScrollView borderBottomColor={"$backgroundFocus"} borderBottomWidth={StyleSheet.hairlineWidth} backgroundColor={"$background"} paddingHorizontal="$3" horizontal paddingTop={"$3"} marginBottom={"$3"} showsHorizontalScrollIndicator={false} alwaysBounceHorizontal={false}>
        <XStack gap={"$3"}>
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
    <Stack paddingHorizontal="$3" backgroundColor={"$background"}>
      <Header characterId={characterId} />
    </Stack>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={renderTabBar}
      lazy
      renderScrollHeader={renderHeader}
      minHeaderHeight={StatusBarHeight}
      animationHeaderPosition={animationHeaderPosition}
      animationHeaderHeight={animationHeaderHeight}
    />
  );
};

export const UserInfoPageWithModal = UserInfoPage;
export const UserInfoPageWithBottomTab = (props: ComponentPropsWithRef<typeof UserInfoPage>) => <SafeAreaView edges={["top"]} style={styles.safeArea}><UserInfoPage {...props} /></SafeAreaView>;

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
  },
  safeArea: {
    flex: 1,
  },
});
