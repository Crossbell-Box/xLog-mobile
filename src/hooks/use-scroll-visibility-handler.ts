import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Easing, runOnUI, useAnimatedScrollHandler, useSharedValue, withTiming } from "react-native-reanimated";

interface Options {
  scrollThreshold: number
}

export function useScrollVisibilityHandler(options: Options) {
  const { scrollThreshold } = options;
  const prevTranslationYAnimValue = useSharedValue<number>(0);
  const isExpandedAnimValue = useSharedValue<number>(1);

  const updateAnimValue = (e: NativeScrollEvent) => {
    "worklet";

    if (
      e.contentOffset.y - prevTranslationYAnimValue.value > scrollThreshold
            && isExpandedAnimValue.value !== 0
    ) {
      isExpandedAnimValue.value = withTiming(0, { easing: Easing.inOut(Easing.ease) });
    }
    else if (
      e.contentOffset.y - prevTranslationYAnimValue.value < -scrollThreshold
            && isExpandedAnimValue.value !== 1
    ) {
      isExpandedAnimValue.value = withTiming(1, { easing: Easing.inOut(Easing.ease) });
    }
  };

  const onScroll = useAnimatedScrollHandler((e) => {
    if (isExpandedAnimValue.value !== 0 && isExpandedAnimValue.value !== 1)
      return;

    updateAnimValue(e);
  }, [scrollThreshold]);

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    prevTranslationYAnimValue.value = e.nativeEvent.contentOffset.y;
  };

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    runOnUI(updateAnimValue)(e.nativeEvent);
  };

  return { onScroll, onScrollEndDrag, onMomentumScrollEnd, isExpandedAnimValue };
}
