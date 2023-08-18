import { Easing, Extrapolate, interpolate, useAnimatedScrollHandler, useSharedValue, withTiming } from "react-native-reanimated";

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
      if (ctx.hasEnded) {
        return;
      }

      const diffY = e.contentOffset.y - ctx.prevTranslationY;

      isExpandedAnimValue.value = interpolate(
        diffY,
        [-scrollThreshold, 0, scrollThreshold],
        [
          1,
          ctx.prevExpandedValue,
          0,
        ],
        Extrapolate.CLAMP,
      );
    },
    onEndDrag: (e, ctx) => {
      ctx.hasEnded = true;
      const diffY = e.contentOffset.y - ctx.prevTranslationY;

      isExpandedAnimValue.value = withTiming(
        diffY > 0 ? 0 : 1,
        {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        },
      );
    },
  }, [scrollThreshold]);

  return {
    onScroll,
    isExpandedAnimValue,
  };
}
