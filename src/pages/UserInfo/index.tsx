import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect, useMemo, useCallback, useState, memo, useRef } from "react";
import { StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Route } from "@showtime-xyz/tab-view";
import { TabView } from "@showtime-xyz/tab-view";
import type { CharacterEntity } from "crossbell";
import { Stack } from "tamagui";

import { PolarLightBackground } from "@/components/PolarLightBackground";
import type { RootStackParamList } from "@/navigation/types";
import { useGetSite } from "@/queries/site";

import { analyzingLink } from "./analyzingLink";
import { Header } from "./Header";
import { HomeScene, TagScene } from "./Scenes";
import { TabBarRenderer } from "./TabBar";

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
    const { slug, pagePath } = analyzingLink(route);

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
