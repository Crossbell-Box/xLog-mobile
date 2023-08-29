import { Easing, Extrapolate, interpolate, useAnimatedScrollHandler, useSharedValue, withTiming } from "react-native-reanimated";

import { IS_ANDROID } from "@/constants";

interface Options {
  scrollThreshold: number
}

export function useScrollVisibilityHandler(options: Options) {
  const { scrollThreshold } = options;
  const isExpandedAnimValue = useSharedValue<number>(1);

  const onScroll = useAnimatedScrollHandler<{
    prevTranslationY: number
    prevExpandedValue: number
    hasEnded: boolean
  }>({
    onBeginDrag: (e, ctx) => {
      ctx.prevTranslationY = e.contentOffset.y;
      ctx.prevExpandedValue = isExpandedAnimValue.value;
      ctx.hasEnded = false;
    },
    onScroll: (e, ctx) => {
      if (
        ctx.hasEnded
        // TODO: https://github.com/software-mansion/react-native-reanimated/issues/4625
        || IS_ANDROID
      ) {
        return;
      }

      const diffY = e.contentOffset.y - ctx.prevTranslationY;

      const value = interpolate(
        diffY,
        [-scrollThreshold, 0, scrollThreshold],
        [
          1,
          ctx.prevExpandedValue,
          0,
        ],
        Extrapolate.CLAMP,
      );

      if (typeof value === "number" && isNaN(value) === false) {
        isExpandedAnimValue.value = value;
      }
    },
    onEndDrag: (e, ctx) => {
      ctx.hasEnded = true;
      const diffY = e.contentOffset.y - ctx.prevTranslationY;

      const value = withTiming(
        diffY > 0 ? 0 : 1,
        {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        },
      );

      if (typeof value === "number" && isNaN(value) === false) {
        isExpandedAnimValue.value = value;
      }
    },
  }, [scrollThreshold]);

  return {
    onScroll,
    isExpandedAnimValue,
  };
}
