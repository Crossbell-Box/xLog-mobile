import type { FC } from "react";

import * as Haptics from "expo-haptics";
import type { GenericTouchableProps } from "react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable";

interface Props extends GenericTouchableProps {
  touchableComponent: React.ComponentType<GenericTouchableProps>
}

export const TouchWithHaptics: FC<Props> = (props) => {
  return (
    <props.touchableComponent
      onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      {...props}
    />
  );
};
