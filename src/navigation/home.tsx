import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Settings2 } from "@tamagui/lucide-icons";

import { Drawer } from "@/components/Drawer";
import { FeedPage } from "@/pages/Feed";
import { Settings } from "@/pages/Settings";

import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

export const HomeNavigator = () => {
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
          name={"Settings"}
          component={Settings}
          options={{
            tabBarShowLabel: false,
            tabBarIcon: props => <Settings2 {...props} />,
          }}
        />
      </HomeBottomTabs.Navigator>
    </Drawer>
  );
};
