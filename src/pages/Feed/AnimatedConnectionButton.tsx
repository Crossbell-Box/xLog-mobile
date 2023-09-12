import type { FC } from "react";
import { useDrawerProgress } from "react-native-drawer-layout";
import type { SharedValue } from "react-native-reanimated";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import { Stack, useWindowDimensions } from "tamagui";

import { ConnectBtn } from "@/components/ConnectionButton";

export const AnimatedConnectionButton: FC<{
  visibleAnimValue?: Animated.SharedValue<number>
}> = (props) => {
  const { visibleAnimValue } = props;
  const { width } = useWindowDimensions();
  const drawerProgressAnimValue = useDrawerProgress() as SharedValue<number>;

  const connectButtonAnimStyle = useAnimatedStyle(() => {
    const aimValue = visibleAnimValue?.value ?? 0;

    const opacity = interpolate(aimValue, [0, 1], [0, 1], Extrapolate.CLAMP);
    const translateY = interpolate(aimValue, [0, 1], [100, 0], Extrapolate.CLAMP);
    const translateX = interpolate(drawerProgressAnimValue.value, [0, 1], [0, width / 2], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [
        { translateY },
        { translateX },
      ],
    };
  }, [width]);

  return (
    <Animated.View style={connectButtonAnimStyle}>
      <Stack position="absolute" bottom={12} left={24} right={24} display="flex" flexDirection="column" gap={12}>
        <ConnectBtn navigateToLogin/>
      </Stack>
    </Animated.View>
  );
};
