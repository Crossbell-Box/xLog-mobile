import type { FC } from "react";
import { useContext, useEffect, useMemo } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Bell, Home, Search, User2 } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { Stack, XStack } from "tamagui";

import { Center } from "@/components/Base/Center";
import { Drawer } from "@/components/Drawer";
import { GlobalAnimationContext } from "@/context/global-animation-context";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { useGetUnreadCount } from "@/models/site.model";
import { ExplorePage } from "@/pages/Explore";
import { FeedPage } from "@/pages/Feed";
import { IntroductionPage } from "@/pages/Introduction";
import { NotificationsPageWithBottomTab } from "@/pages/Profile/Notifications";
import { MyUserInfoPage } from "@/pages/UserInfo";

import type { HomeBottomTabsParamList } from "./types";

const HomeBottomTabs = createBottomTabNavigator<HomeBottomTabsParamList>();

const TabBar: FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const { isExpandedAnimValue } = useContext(GlobalAnimationContext).homeFeed;
  const height = 55;
  const bottomSize = bottom + 20;
  const animStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isExpandedAnimValue.value, [0, 1], [0, 1], "clamp"),
      transform: [
        {
          translateY: interpolate(isExpandedAnimValue.value, [0, 1], [height + bottomSize, 0], "clamp"),
        },
      ],
    };
  });

  return (
    <Animated.View style={animStyles}>
      <Stack alignSelf="center" backgroundColor={"rgba(50, 50, 50, 0.4)"} borderRadius={100} bottom={bottomSize} width={"95%"} height={height} position="absolute" overflow="hidden">
        <BlurView tint="dark" intensity={30} style={{
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1,
        }} />
        <XStack zIndex={2} flex={1} >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const Icon = options.tabBarIcon;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                // TODO
                // The `merge: true` option makes sure that the params inside the tab screen are preserved
                // @ts-expect-error
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={route.name}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ flex: 1 }}
                containerStyle={{ flex: 1 }}
              >
                <Center flex={1}>
                  <Icon focused={isFocused} color={isFocused ? "white" : "#939393"} size={24}/>
                </Center>
              </TouchableOpacity>
            );
          })}
        </XStack>
      </Stack>
    </Animated.View>
  );
};

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
        tabBar={props => <TabBar {...props} />}
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
