import type { FC, PropsWithChildren } from "react";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountCharacter } from "@crossbell/react-account";
import { ArrowUpDown, MoveVertical } from "@tamagui/lucide-icons";
import { Stack, Text, Theme, XStack } from "tamagui";

import { useColors } from "@/hooks/use-colors";
import { useDrawer } from "@/hooks/use-drawer";
import { useThemeStore } from "@/hooks/use-theme-store";
import { GA } from "@/utils/GA";

import { feedTypes, type FeedType } from "./feedTypes";

import { Avatar } from "../../components/Avatar";
import { XTouch } from "../../components/XTouch";

export interface Props {
  expanded: SharedValue<number>
  type?: FeedType
  onPressSortBy: () => void
}

export const HeaderAnimatedLayout: FC<PropsWithChildren<Props>> = (props) => {
  const { expanded, children, type, onPressSortBy } = props;
  const { background } = useColors();
  const { top } = useSafeAreaInsets();
  const { openDrawer: _openDrawer } = useDrawer();
  const character = useAccountCharacter();
  const { isDarkMode } = useThemeStore();

  const containerAnimStyles = useAnimatedStyle(() => {
    return {
      height: interpolate(expanded.value, [0, 1], [55, 110], Extrapolate.CLAMP) + top,
    };
  }, [top, expanded]);

  const avatarAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expanded.value, [0, 1], [0, 1], Extrapolate.CLAMP),
    };
  }, []);

  const openDrawer = useCallback(() => {
    _openDrawer();
    GA.logEvent("open_drawer_from_header_avatar");
  }, []);

  return (
    <Animated.View style={[containerAnimStyles, styles.contentContainer]}>
      <Animated.View style={[avatarAnimStyles, styles.avatarContainer]}>
        <XStack justifyContent="space-between" alignItems="center">
          <Stack>
            <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} containerStyle={styles.avatarTouchableContainer} onPress={openDrawer}>
              <Avatar size={35} character={character} isNavigateToUserInfo={false} useDefault/>
            </XTouch>
          </Stack>

          {type === feedTypes.LATEST && (
            <XTouch enableHaptics touchableComponent={TouchableWithoutFeedback} onPress={onPressSortBy}>
              <Theme name={isDarkMode ? "light" : "dark"}>
                <XStack
                  gap="$1"
                  alignItems="center"
                  backgroundColor={"$background"}
                  paddingVertical="$2"
                  paddingHorizontal="$3"
                  borderRadius={"$10"}
                >
                  <Text fontSize={"$1"} color={"$color"}>Sort By</Text>
                  <MoveVertical size={"$0.5"} color={"$color"}/>
                </XStack>
              </Theme>
            </XTouch>
          )}
        </XStack>
      </Animated.View>
      <Animated.View style={styles.tabContainer}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    justifyContent: "flex-end",
  },
  logo: {
    width: 30,
    height: 30,
  },
  avatarTouchableContainer: {
    zIndex: 2,
    width: 45,
  },
  avatarContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
  tabContainer: {
    width: "100%",
  },
});
