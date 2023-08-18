import type { FC } from "react";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, interpolateColor, useAnimatedStyle } from "react-native-reanimated";

export const AnimatedTab: FC<{
  label: string
  index: number
  animVal: SharedValue<number>
}> = ({ label, animVal, index }) => {
  const animStyles = useAnimatedStyle(() => {
    const av = animVal.value;
    const input = [0, 1];
    return {
      color: interpolateColor(av, input, ["#8F8F91", "white"]),
      fontSize: interpolate(av, input, [16, 36]),
      lineHeight: interpolate(av, input, [26, 36]),
    };
  }, [index]);

  return (
    <Animated.Text style={animStyles}>
      {label}
    </Animated.Text>
  );
};
