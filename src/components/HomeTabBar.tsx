import type { FC } from "react";
import { useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Stack, XStack } from "tamagui";

import { Center } from "@/components/Base/Center";
import { CreateShortsButton } from "@/components/CreateShortsButton";
import { GlobalStateContext } from "@/context/global-state-context";
import { homeTabHeaderHeight } from "@/pages/Feed/HeaderAnimatedLayout";

export const HomeTabBar: FC<BottomTabBarProps> = (props) => {
  const { state, descriptors, navigation } = props;
  const { bottom } = useSafeAreaInsets();
  const { isExpandedAnimValue } = useContext(GlobalStateContext).homeFeed;

  const height = homeTabHeaderHeight;
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

  const tabs = useMemo(() => {
    return state.routes.map((route, index) => {
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
          <Center flex={1} >
            <Icon
              focused={isFocused}
              color={isFocused ? "white" : "#cbcbcbca"}
              size={24}
            />
          </Center>
        </TouchableOpacity>
      );
    });
  }, [
    descriptors,
    navigation,
    state,
  ]);

  return (
    <Animated.View style={animStyles}>
      <Stack
        alignSelf="center"
        bottom={bottomSize}
        width={"95%"}
        height={height}
        position="absolute"
        borderRadius={100}
        overflow="hidden"
      >
        <BlurView tint="dark" intensity={30} experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFillObject}/>

        <XStack zIndex={2} flex={1} alignItems="center">
          {[
            ...tabs.slice(0, 2),
            <CreateShortsButton key={"center"}/>,
            ...tabs.slice(2),
          ]}
        </XStack>
      </Stack>
    </Animated.View>
  );
};
