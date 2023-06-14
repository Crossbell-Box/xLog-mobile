import type { FC } from "react";
import { StyleSheet } from "react-native";
import { useDrawerProgress } from "react-native-drawer-layout";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountCharacter } from "@crossbell/react-account";
import { Image } from "expo-image";
import { H2, useWindowDimensions, XStack } from "tamagui";

import { LogoDark, LogoLight } from "@/constants/resource";
import { useDrawer } from "@/hooks/use-drawer";
import { useThemeStore } from "@/hooks/use-theme-store";

import { Avatar } from "../Avatar";
import { XTouch } from "../XTouch";

export interface Props {
  expanded: SharedValue<0 | 1>
}

export const NavigationHeader: FC<Props> = (props) => {
  const { expanded } = props;
  const { top } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { openDrawer } = useDrawer();
  const { isDarkMode: isDark } = useThemeStore();
  const character = useAccountCharacter();
  const drawerProgress = useDrawerProgress() as SharedValue<number>;

  const containerAnimStyles = useAnimatedStyle(() => {
    return {
      height: interpolate(expanded.value, [0, 1], [top, top + 35]),
      paddingTop: top + 5,
    };
  }, [top, expanded]);

  const avatarAnimStyles = useAnimatedStyle(() => {
    return {
      left: interpolate(expanded.value, [0, 1], [-100, 10], Extrapolate.CLAMP),
      opacity: interpolate(drawerProgress.value, [1, 0], [0, 1], Extrapolate.CLAMP),
    };
  }, [top, expanded]);

  const contentContainerAnimStyles = useAnimatedStyle(() => {
    return {
      bottom: interpolate(expanded.value, [0, 1], [-42, -5], Extrapolate.CLAMP),
      right: 0,
      width: interpolate(expanded.value, [0, 1], [100, width], Extrapolate.CLAMP),
      transform: [
        {
          scale: interpolate(expanded.value, [0, 1], [0.7, 1], Extrapolate.CLAMP),
        },
      ],
    };
  }, [expanded, width]);

  return (
    <Animated.View style={containerAnimStyles}>
      {character && (
        <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} containerStyle={styles.avatarContainer} onPress={openDrawer}>
          <Animated.View style={avatarAnimStyles}>
            <Avatar size={35} character={character} isNavigateToUserInfo={false}/>
          </Animated.View>
        </XTouch>
      )}
      <Animated.View style={[contentContainerAnimStyles, styles.contentContainer]}>
        <XStack gap="$2" justifyContent="center" alignItems="center">
          <Image source={isDark ? LogoLight : LogoDark} contentFit={"contain"} style={styles.logo} />
          <H2 fontWeight={"700"} fontSize={24}>xLog</H2>
        </XStack>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    position: "absolute",
  },
  logo: {
    width: 30,
    height: 30,
  },
  avatarContainer: {
    zIndex: 2,
  },
});
