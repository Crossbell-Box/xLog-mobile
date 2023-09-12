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
    beginDrag: boolean
  }>({
    onBeginDrag: (e, ctx) => {
      ctx.prevTranslationY = e.contentOffset.y;
      ctx.prevExpandedValue = isExpandedAnimValue.value;
      ctx.beginDrag = true;
    },
    onScroll: (e, ctx) => {
      if (!ctx.beginDrag) {
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

      if (
        typeof value === "number"
        && isNaN(value) === false
      ) {
        isExpandedAnimValue.value = value;
      }
    },
    onEndDrag: (e, ctx) => {
      if (
        !ctx.beginDrag
        || e.contentOffset.y < 110
      ) {
        return;
      }

      const diffY = e.contentOffset.y - ctx.prevTranslationY;

      const value = withTiming(
        diffY > 0 ? 0 : 1,
        {
          duration: 150,
          easing: Easing.inOut(Easing.ease),
        },
      );

      isExpandedAnimValue.value = value;
      ctx.beginDrag = false;
    },
  }, [scrollThreshold]);

  return {
    onScroll,
    isExpandedAnimValue,
  };
}
