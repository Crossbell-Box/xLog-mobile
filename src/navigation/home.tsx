import { RefreshControl } from "react-native-gesture-handler";

import { useIsConnected } from "@crossbell/react-account";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MasonryFlashList } from "@shopify/flash-list";
import { Bell, Home, Image, Search, User2 } from "@tamagui/lucide-icons";
import { Stack } from "tamagui";

import { Drawer } from "@/components/Drawer";
import { HomeTabBar } from "@/components/HomeTabBar";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import { useIsLogin } from "@/hooks/use-is-login";
import { useGetUnreadCount } from "@/models/site.model";
import { ExplorePage } from "@/pages/Explore";
import { FeedPage } from "@/pages/Feed";
import { postSearchTypes, shortsSearchTypes } from "@/pages/Feed/feedTypes";
import { IntroductionPage } from "@/pages/Introduction";
import { NotificationsPageWithBottomTab } from "@/pages/Profile/Notifications";
import { MyUserInfoPage } from "@/pages/UserInfo";

import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

function AA() {
  return (
    <Stack flex={1} backgroundColor={"red"}>
      <MasonryFlashList
        data={Array.from({ length: 40 }).map((_, i) => ({ title: i }))}
        numColumns={2}
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={() => {}}
          />
        )}
        renderItem={({ item }) => {
          return (
            <Stack
              width={100}
              height={100}
              backgroundColor={"blue"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Search />
            </Stack>
          );
        }}
        estimatedItemSize={200}
      />
    </Stack>
  );
}

export const HomeNavigator = () => {
  const { pick } = useColors();
  const characterId = useCharacterId();
  const isLogin = useIsLogin();
  const notificationUnreadCount = useGetUnreadCount(characterId);

  return (
    <Drawer>
      <HomeBottomTabs.Navigator
        initialRouteName="Feed"
        screenOptions={{ headerShown: false }}
        tabBar={props => <HomeTabBar {...props} />}
      >
        <HomeBottomTabs.Screen
          name={"Feed"}
          component={FeedPage}
          initialParams={{
            isShorts: false,
            type: postSearchTypes.FEATURED,
          }}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Home {...props} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Shorts"}
          component={FeedPage}
          initialParams={{
            isShorts: true,
            type: shortsSearchTypes.SHORTS,
          }}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Image {...props} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Notifications"}
          component={
            isLogin
              ? NotificationsPageWithBottomTab
              : IntroductionPage
          }
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Bell {...props} />,
            // @ts-expect-error
            tabBarBadge: isLogin
              ? notificationUnreadCount?.data?.count > 0 ? true : undefined
              : undefined,
            tabBarBadgeStyle: {
              backgroundColor: pick("red10"),
              transform: [{ scale: 0.5 }],
            },
          }}
        />
        <HomeBottomTabs.Screen
          name={"Profile"}
          key={characterId}
          component={
            isLogin
              ? MyUserInfoPage
              : IntroductionPage
          }
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <User2 {...props} />,
          }}
        />
      </HomeBottomTabs.Navigator>
    </Drawer>
  );
};
