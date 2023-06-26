import { useAccountCharacterId, useIsConnected } from "@crossbell/react-account";
import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { EventListenerCallback } from "@react-navigation/native";
import { Bell, Home, User2 } from "@tamagui/lucide-icons";

import { Drawer } from "@/components/Drawer";
import { useColors } from "@/hooks/use-colors";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useGetUnreadCount } from "@/models/site.model";
import { FeedPage } from "@/pages/Feed";
import { NotificationsPageWithBottomTab } from "@/pages/Profile/Notifications";
import { UserInfoPageWithBottomTab } from "@/pages/UserInfo";

import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

export const HomeNavigator = () => {
  const { pick } = useColors();
  const { characterId } = useAccountCharacterId();
  const isConnected = useIsConnected();
  const navigation = useRootNavigation();
  const notificationUnreadCount = useGetUnreadCount(characterId);

  const tabPressHandler = (name: keyof HomeBottomTabsParamList): EventListenerCallback<BottomTabNavigationEventMap, "tabPress"> => {
    return (e) => {
      if (name === "Notifications") {
        notificationUnreadCount.refetch();
      }
      if (!isConnected) {
        navigation.navigate("Login");
        e.preventDefault();
      }
    };
  };

  return (
    <Drawer>
      <HomeBottomTabs.Navigator
        initialRouteName="Feed"
        screenOptions={{
          headerShown: false,
        }}
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
          name={"Notifications"}
          component={NotificationsPageWithBottomTab}
          listeners={{
            tabPress: tabPressHandler("Notifications"),
          }}
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
          initialParams={{ characterId }}
          component={UserInfoPageWithBottomTab}
          listeners={{
            tabPress: tabPressHandler("Profile"),
          }}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <User2 {...props} />,
          }}
        />
      </HomeBottomTabs.Navigator>
    </Drawer>
  );
};
