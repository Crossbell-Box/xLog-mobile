import React, { useMemo, useState, memo } from "react";
import { useTranslation } from "react-i18next";

import type { Route, TabView } from "@showtime-xyz/tab-view";
import { ScrollView, Stack, XStack } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import type { ExpandedNote } from "@/types/crossbell";

import { analyzingLink, LinkType } from "./analyzingLink";
import { TabItem, TabItemRenderer } from "./TabItem";

type TabBarProps = Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0];
interface TabBarRendererProps extends TabBarProps {
  defaultRoute: Route
  characterId: number
}

export const TabBarRenderer = memo((props: TabBarRendererProps) => {
  const { navigationState, defaultRoute, characterId } = props;
  const [currentTabKey, setCurrentTabKey] = useState(defaultRoute?.key);
  const navigation = useRootNavigation();
  const i18n = useTranslation();

  const onPress = (
    link: Route,
    note?: ExpandedNote,
  ) => {
    const analyzedLink = analyzingLink(link);

    if (analyzedLink.type === LinkType.INTERNAL) {
      setCurrentTabKey(link.key);
      props.jumpTo(link.key);
    }
    else if (analyzedLink.type === LinkType.EXTERNAL) {
      navigation.navigate(
        "Web",
        {
          title: link.title,
          url: link.key,
        },
      );
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

  const routes = useMemo(() => {
    const internalRoutes = [];
    const externalRoutes = [];
    const postRoutes = [];

    navigationState.routes.forEach((link: Route) => {
      const internalTab = analyzingLink(link);

      if (internalTab.type === LinkType.INTERNAL) {
        internalRoutes.push(link);
      }
      else if (internalTab.type === LinkType.EXTERNAL) {
        externalRoutes.push(link);
      }
      else if (internalTab.type === LinkType.POST) {
        postRoutes.push(link);
      }
    });

    return {
      internal: internalRoutes,
      external: externalRoutes,
      post: postRoutes,
    };
  }, [navigationState.routes]);

  return (
    <Stack backgroundColor={"#000"}>
      <ScrollView
        borderTopLeftRadius={"$6"}
        borderTopRightRadius={"$6"}
        horizontal
        paddingTop={"$3"}
        paddingHorizontal="$3"
        backgroundColor={"$userinfoSceneBackground"}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
      >
        <XStack gap={"$3"} paddingTop={"$2"}>
          {
            routes.internal.map((link: Route) => (
              <TabItem
                key={link.key}
                {...props}
                isActive={currentTabKey === link.key}
                onPressTab={onPress}
                characterId={characterId}
                link={link}
              />
            ))
          }
          {
            routes.external.map((link: Route) => (
              <TabItemRenderer
                key={link.key}
                isActive={false}
                isLoading={false}
                onPressTab={() => onPress(link)}
                title={link.title}
              />
            ))
          }
          {
            routes.post.map((link: Route) => (
              <TabItem
                key={link.key}
                {...props}
                isActive={false}
                onPressTab={onPress}
                characterId={characterId}
                link={link}
              />
            ))
          }
          <TabItemRenderer
            isActive={false}
            isLoading={false}
            onPressTab={() => {
              navigation.navigate(
                "Achievements",
                { characterId },
              );
            }}
            title={i18n.t("Badges")}
          />
        </XStack>
      </ScrollView>
    </Stack>
  );
}, (
  prevProps,
  nextProps,
) => (prevProps.navigationState === nextProps.navigationState),
);
