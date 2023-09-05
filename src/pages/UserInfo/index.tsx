import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect, useMemo, useCallback, useState, memo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Route } from "@showtime-xyz/tab-view";
import { TabView } from "@showtime-xyz/tab-view";
import type { CharacterEntity } from "crossbell";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, Spinner, Stack, Text, XStack } from "tamagui";

import { TabMasonryFeedList } from "@/components/FeedList";
import { PolarLightBackground } from "@/components/PolarLightBackground";
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
  "/portfolios", // 作品集 (TODO)
];

type TabBarProps = Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0];

interface TabBarItemProps extends TabBarProps {
  isActive: boolean
  characterId: number
  link: Route
  onPressTab: (key: string) => void
}

function internalLink(link: Route) {
  try {
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
  catch (e) {
    return {
      isInternal: false,
      slug: undefined,
      pagePath: undefined,
    };
  }
}

export const TabItem: FC<TabBarItemProps> = (props) => {
  const { isActive, characterId, link, jumpTo, onPressTab } = props;
  const i18n = useTranslation();
  const [note, setNote] = useState<ExpandedNote | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const internalTab = useRef(internalLink(link)).current;
  const navigation = useRootNavigation();

  useEffect(() => {
    if (
      !internalTab.isInternal && !note
    ) {
      setLoading(true);
      const slug = link.key.split("/")[1];
      getPage({ slug, characterId })
        .then(r => (r?.noteId && setNote(r)))
        .finally(() => setLoading(false));
    }
  }, [characterId, link, note]);

  const onPress = () => {
    if (internalTab.isInternal) {
      jumpTo(link.key);
      onPressTab(link.key);
    }
    else if (note?.noteId) {
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
    <Stack onPress={onPress} paddingBottom="$2">
      {
        loading
          ? <Spinner size="small" />
          : <Text color={isActive ? "$color" : "#BEBEBE"}>{i18n.t(link?.title)}</Text>
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

interface TabBarRendererProps extends TabBarProps {
  defaultRoute: Route
  characterId: number
}

const TabBarRenderer = memo((props: TabBarRendererProps) => {
  const { navigationState, defaultRoute, characterId } = props;
  const [currentTabKey, setCurrentTabKey] = useState(defaultRoute?.key);

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
          navigationState.routes.map((link: Route) => (
            <TabItem
              key={link.key}
              {...props}
              isActive={currentTabKey === link.key}
              onPressTab={setCurrentTabKey}
              characterId={characterId}
              link={link}
            />
          ))
        }
      </XStack>
    </ScrollView>
  );
}, (
  prevProps,
  nextProps,
) => (prevProps.navigationState === nextProps.navigationState),
);

export interface Props {
  character: CharacterEntity
}

const UserInfoPage: FC<NativeStackScreenProps<RootStackParamList, "UserInfo"> & { displayHeader?: boolean }> = (props) => {
  const { route, displayHeader } = props;
  const character = route?.params?.character;
  const characterId = character?.characterId;
  const { top } = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const animationHeaderPosition = useSharedValue(0);
  const site = useGetSite(character?.handle);
  const routes = useMemo<Route[]>(() => {
    if (!site) return [];

    const navigation = site.data?.metadata?.content?.navigation || [];

    if (!navigation) return [];

    const links
      = navigation?.find(nav => nav.url === "/")
        ? navigation
        : [{ label: "Home", url: "/" }, ...navigation];

    return links.map((link, index) => ({ key: link.url, title: link.label, index }));
  }, [site]);

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

  const renderHeader = () => (
    <Stack paddingHorizontal="$3" paddingTop={top} backgroundColor={"$background"}>
      <PolarLightBackground activeIndex={0}/>
      <Header characterId={characterId} titleAnimatedValue={displayHeader ? animationHeaderPosition : undefined} />
    </Stack>
  );

  const navigationState = useMemo(() => ({ index, routes }), [index, routes]);

  return (
    <Stack flex={1}>
      <TabView
        navigationState={navigationState}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <TabBarRenderer
            {...props}
            characterId={characterId}
            defaultRoute={routes[0]}
          />
        )}
        lazy
        renderScrollHeader={renderHeader}
        minHeaderHeight={top}
        animationHeaderPosition={animationHeaderPosition}
        swipeEnabled={false}
        style={styles.tavViewContainer}
      />
      {/* TODO */}
      <Stack position="absolute" top={0} bottom={0} left={0} width={2}/>
    </Stack>
  );
};

export const OthersUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => <UserInfoPage {...props} displayHeader />;
export const MyUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => {
  const { data: character } = useCharacter();

  useEffect(() => {
    character && props.navigation.setParams({ character });
  }, [character]);

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><UserInfoPage {...props} /></SafeAreaView>;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tavViewContainer: {
    backgroundColor: "#1F1E20",
  },
});
