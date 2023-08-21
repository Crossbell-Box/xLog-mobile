import type { FC, PropsWithChildren } from "react";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountCharacter } from "@crossbell/react-account";

import { useColors } from "@/hooks/use-colors";
import { useDrawer } from "@/hooks/use-drawer";
import { GA } from "@/utils/GA";

import { Avatar } from "./Avatar";
import { XTouch } from "./XTouch";

export interface Props {
  expanded: SharedValue<number>
}

export const NavigationHeader: FC<PropsWithChildren<Props>> = (props) => {
  const { expanded, children } = props;
  const { background } = useColors();
  const { top } = useSafeAreaInsets();
  const { openDrawer: _openDrawer } = useDrawer();
  const character = useAccountCharacter();

  const containerAnimStyles = useAnimatedStyle(() => {
    return {
      height: interpolate(expanded.value, [0, 1], [55, 110], Extrapolate.CLAMP) + top,
    };
  }, [top, expanded, background]);

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
        {character && (
          <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} containerStyle={styles.avatarTouchableContainer} onPress={openDrawer}>
            <Avatar size={35} character={character} isNavigateToUserInfo={false}/>
          </XTouch>
        )}
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
