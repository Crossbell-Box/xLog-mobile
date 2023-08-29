import { useEffect, type FC, type PropsWithChildren } from "react";
import type { ViewStyle } from "react-native";
import Animated, { cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { Stack } from "tamagui";

export const Badge: FC<PropsWithChildren<{
  size: number
  visible?: boolean
  color?: ViewStyle["backgroundColor"]
  breathing?: boolean
}>> = ({ children, size = 5, visible = true, color, breathing = false }) => {
  const animatedValue = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(animatedValue.value, [0, 1], [1, 1.25]),
        },
      ],
      opacity: interpolate(animatedValue.value, [0, 1], [1, 0.2]),
    };
  }, []);

  useEffect(() => {
    if (breathing) {
      animatedValue.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    }
    else {
      animatedValue.value = 0;
      cancelAnimation(animatedValue);
    }
  }, [breathing]);

  return (
    <Stack>
      {visible && (
        <Animated.View style={[{
          borderRadius: 50,
          width: size,
          height: size,
          backgroundColor: color ?? "white",
          position: "absolute",
          right: -size,
          top: -size,
        }, animatedStyles]}/>
      )}
      {children}
    </Stack>
  );
};

