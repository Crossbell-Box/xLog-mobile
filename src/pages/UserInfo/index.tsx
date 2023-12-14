import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fetchCharacter, useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Route } from "@showtime-xyz/tab-view";
import { TabView } from "@showtime-xyz/tab-view";
import type { CharacterEntity } from "crossbell";
import { Stack, Theme } from "tamagui";

import { PolarLightBackground } from "@/components/PolarLightBackground";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import type { RootStackParamList } from "@/navigation/types";
import { useGetSite } from "@/queries/site";

import { analyzingLink } from "./analyzingLink";
import { Header } from "./Header";
import { HomeScene, ShortsScene, TagScene } from "./Scenes";
import { TabBarRenderer } from "./TabBar";

export interface Props {
  character: CharacterEntity
}

const UserInfoPage: FC<NativeStackScreenProps<RootStackParamList, "UserInfo"> & {
  displayHeader?: boolean
  character?: CharacterEntity
}> = (props) => {
  const { route, displayHeader } = props;
  const character = route?.params?.character ?? props.character;
  const characterId = character?.characterId;
  const { pick } = useColors();
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
        : [
          { label: "Home", url: "/" },
          { label: "Shorts", url: "/shorts" },
          ...navigation,
        ];

    return links.map((link, index) => ({ key: link.url, title: link.label, index }));
  }, [site]);

  const renderScene = useCallback(({ route }: { route: Route }) => {
    const { slug, pagePath } = analyzingLink(route);

    if (pagePath === "/tag") {
      return <TagScene tags={[slug]} characterId={characterId} index={0} />;
    }

    if (pagePath === "/shorts") {
      return <ShortsScene characterId={characterId} handle={character?.handle} index={0} />;
    }

    if (pagePath === "/") {
      return <HomeScene characterId={characterId} handle={character?.handle} index={0} />;
    }

    return null;
  }, [characterId]);

  const renderHeader = () => (
    <Stack paddingHorizontal="$3" paddingTop={top} backgroundColor={"$bottomSheetBackground"}>
      <PolarLightBackground activeIndex={0}/>
      <Theme name="dark">
        <Header characterId={characterId} titleAnimatedValue={displayHeader ? animationHeaderPosition : undefined} />
      </Theme>
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
        style={{ backgroundColor: pick("userinfoSceneBackground") }}
      />
      {/* TODO */}
      <Stack position="absolute" top={0} bottom={0} left={0} width={8}/>
    </Stack>
  );
};

export const OthersUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => <UserInfoPage {...props} displayHeader />;

export const MyUserInfoPage = (props: ComponentPropsWithRef<typeof UserInfoPage>) => {
  const characterId = useCharacterId();
  const character = useCharacter(characterId);

  return <UserInfoPage {...props} character={character.data}/>;
};
