import { Easing, Extrapolate, interpolate, runOnJS, runOnUI, useAnimatedScrollHandler, useSharedValue, withTiming } from "react-native-reanimated";

interface Options {
  scrollThreshold: number
}

export function useScrollVisibilityHandler(options: Options) {
  const { scrollThreshold } = options;
  const isExpandedAnimValue = useSharedValue<number>(1);
  const prevExpandedValue = useSharedValue<number>(isExpandedAnimValue.value);

  const updateAnimationValue = (currentY: number, prevY: number) => {
    "worklet";
    const diffY = currentY - prevY;
    const shouldExpand = diffY < 0 || currentY < scrollThreshold;
    const value = withTiming(
      shouldExpand ? 1 : 0,
      {
        duration: 150,
        easing: Easing.inOut(Easing.ease),
      },
      (finished) => {
        if (finished) {
          prevExpandedValue.value = isExpandedAnimValue.value;
        }
      },
    );

    isExpandedAnimValue.value = value;
  };

  const onScroll = useAnimatedScrollHandler<{
    prevTranslationY: number
    prevExpandedValue: number
    beginDrag: boolean
  }>({
    onBeginDrag: (e, ctx) => {
      ctx.prevTranslationY = e.contentOffset.y;
      ctx.prevExpandedValue = prevExpandedValue.value;
      ctx.beginDrag = true;
    },
    onScroll: (e, ctx) => {
      if (!ctx.beginDrag) {
        return;
      }

      const diffY = e.contentOffset.y - ctx.prevTranslationY;
      const scaledDiffY = Math.max(Math.min(diffY, scrollThreshold), -scrollThreshold);
      const value = interpolate(
        Math.round(scaledDiffY * 100) / 100,
        [-scrollThreshold, 0, scrollThreshold],
        [1, ctx.prevExpandedValue, 0],
        Extrapolate.CLAMP,
      );

      if (typeof value === "number" && isNaN(value) === false) {
        isExpandedAnimValue.value = value;
      }
    },
    onEndDrag: (e, ctx) => {
      if (!ctx.beginDrag) {
        return;
      }

      updateAnimationValue(e.contentOffset.y, ctx.prevTranslationY);
      ctx.beginDrag = false;
    },
    onMomentumEnd: (e, ctx) => {
      if (!ctx.beginDrag) {
        return;
      }

      updateAnimationValue(e.contentOffset.y, ctx.prevTranslationY);
      ctx.beginDrag = false;
    },
  }, [scrollThreshold]);

  return {
    onScroll,
    isExpandedAnimValue,
  };
}
