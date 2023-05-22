import type { FC } from "react";
import type { ViewProps, ViewStyle } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

export const KeyboardAvoidingView: FC<ViewProps & {
  style?: ViewStyle
}> = (props) => {
  const height = useSharedValue(0);
  const animStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: -height.value },
      ],
    };
  });

  useKeyboardHandler({
    onMove(e) {
      "worklet";
      height.value = e.height;
    },
  });

  return (
    <Animated.View {...props} style={[props.style, animStyles]}/>
  );
};
