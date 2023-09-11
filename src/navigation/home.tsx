import { useIsConnected } from "@crossbell/react-account";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Bell, Home, Search, User2 } from "@tamagui/lucide-icons";

import { Drawer } from "@/components/Drawer";
import { HomeTabBar } from "@/components/HomeTabBar";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import { useGetUnreadCount } from "@/models/site.model";
import { ExplorePage } from "@/pages/Explore";
import { FeedPage } from "@/pages/Feed";
import { IntroductionPage } from "@/pages/Introduction";
import { NotificationsPageWithBottomTab } from "@/pages/Profile/Notifications";
import { MyUserInfoPage } from "@/pages/UserInfo";

import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

export const HomeNavigator = () => {
  const { pick } = useColors();
  const characterId = useCharacterId();
  const isConnected = useIsConnected();
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
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Home {...props} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Explore"}
          component={ExplorePage}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Search {...props} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Notifications"}
          component={
            isConnected
              ? NotificationsPageWithBottomTab
              : IntroductionPage
          }
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Bell {...props} />,
            // @ts-expect-error
            tabBarBadge: isConnected
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
            isConnected
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
