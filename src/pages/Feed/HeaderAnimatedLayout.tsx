import type { FC, PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isIOS } from "@/constants/platform";
import { useDrawer } from "@/hooks/use-drawer";

import type { ShortsSearchType, PostSearchType } from "./feedTypes";

export interface Props {
  expanded: SharedValue<number>
  type?: PostSearchType | ShortsSearchType
  onPressSortBy: () => void
}

export const homeTabHeaderHeight = 55;
export const extraGapBetweenIOSAndAndroid = isIOS ? 0 : 18;

export const HeaderAnimatedLayout: FC<PropsWithChildren<Props>> = (props) => {
  const { expanded, children } = props;
  const { top } = useSafeAreaInsets();
  const { openDrawer: _openDrawer } = useDrawer();

  const containerAnimStyles = useAnimatedStyle(() => {
    return {
      height: interpolate(expanded.value, [0, 1], [0, homeTabHeaderHeight + top], Extrapolation.CLAMP),
      opacity: interpolate(expanded.value, [0, 1], [0, 1], Extrapolation.CLAMP),
    };
  }, [top, expanded]);

  return (
    <Animated.View style={[containerAnimStyles, styles.contentContainer]}>
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
