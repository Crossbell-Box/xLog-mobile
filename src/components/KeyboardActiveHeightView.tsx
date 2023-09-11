import { type FC } from "react";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";

export const KeyboardActiveHeightView: FC<{
  animated?: boolean
}> = (props) => {
  const { animated = true } = props;
  const { height: _height } = useReanimatedKeyboardAnimation();
  const height = useDerivedValue(() => {
    if (!animated) return _height.value;
    return withTiming(_height.value);
  });

  const animStyles = useAnimatedStyle(() => {
    return { height: Math.abs(height.value) };
  });

  return (
    <Animated.View {...props} style={animStyles}/>
  );
};
