import { useEffect, type FC } from "react";
import type { ViewProps, ViewStyle } from "react-native";
import { useKeyboardHandler, useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";

export const KeyboardAvoidingView: FC<ViewProps & {
  style?: ViewStyle
}> = (props) => {
  const { height: _height } = useReanimatedKeyboardAnimation();
  const height = useDerivedValue(() => withTiming(_height.value));

  const animStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: height.value },
      ],
    };
  });

  return (
    <Animated.View {...props} style={[props.style, animStyles]}/>
  );
};
