import type { FC } from "react";

import * as Haptics from "expo-haptics";
import type { GenericTouchableProps } from "react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable";

import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { callChain } from "@/utils/call-chain";

interface Props extends GenericTouchableProps {
  touchableComponent: React.ComponentType<GenericTouchableProps>

  enableHaptics?: boolean
  hapticsType?: Haptics.ImpactFeedbackStyle
  hitSlopSize?: number
}

export const XTouch: FC<Props> = (props) => {
  const { enableHaptics = false, hapticsType = Haptics.ImpactFeedbackStyle.Light, hitSlopSize = 0 } = props;

  const hitSlop = useHitSlopSize(hitSlopSize);

  return (
    <props.touchableComponent
      {...props}
      hitSlop={props.hitSlop ?? hitSlop.hitSlop}
      onLayout={callChain([props.onLayout, hitSlop.onLayout])}
      onPressIn={callChain([
        props.onPressIn,
        () => {
          if (enableHaptics) {
            Haptics.impactAsync(hapticsType);
          }
        },
      ])}
    />
  );
};

