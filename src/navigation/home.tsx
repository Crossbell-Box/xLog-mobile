import { useAccountCharacterId } from "@crossbell/react-account";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Bell, Home, Settings2, User2 } from "@tamagui/lucide-icons";
import { Stack } from "tamagui";

import { Drawer } from "@/components/Drawer";
import { useRootNavigation } from "@/hooks/use-navigation";
import { FeedPage } from "@/pages/Feed";
import { NotificationsPageWithBottomTab } from "@/pages/Profile/Notifications";
import { Settings } from "@/pages/Settings";
import { UserInfoPageWithBottomTab } from "@/pages/UserInfo";

import { SettingsNavigator } from "./settings";
import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

export const HomeNavigator = () => {
  const { characterId } = useAccountCharacterId();
  const navigation = useRootNavigation();

  const TabBarButton = ({ children, onPress }: BottomTabBarButtonProps) => {
    return (
      <Stack flex={1} onPress={onPress}>
        {children}
      </Stack>
    );
  };

  const navigateWithAuth = (fn: BottomTabBarButtonProps["onPress"]) => {
    if (!characterId) {
      return () => navigation.navigate("Login");
    }
    return fn;
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
            tabBarButton: props => <TabBarButton {...props} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Notifications"}
          component={NotificationsPageWithBottomTab}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Bell {...props} />,
            tabBarButton: props => <TabBarButton {...props} onPress={navigateWithAuth(props.onPress)} />,
          }}
        />
        <HomeBottomTabs.Screen
          name={"Profile"}
          initialParams={{ characterId }}
          component={UserInfoPageWithBottomTab}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <User2 {...props} />,
            tabBarButton: props => <TabBarButton {...props} onPress={navigateWithAuth(props.onPress)} />,
          }}
        />
      </HomeBottomTabs.Navigator>
    </Drawer>
  );
};
