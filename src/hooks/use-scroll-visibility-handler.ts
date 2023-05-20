import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { runOnUI, useAnimatedScrollHandler, useSharedValue, withSpring } from "react-native-reanimated";

interface Options {
  scrollThreshold: number
}

export function useScrollVisibilityHandler(options: Options) {
  const { scrollThreshold } = options;
  const prevTranslationYAnimValue = useSharedValue<number>(0);
  const isExpandedAnimValue = useSharedValue<0 | 1>(1);

  const updateAnimValue = (e: NativeScrollEvent) => {
    "worklet";

    if (
      e.contentOffset.y - prevTranslationYAnimValue.value > scrollThreshold
            && isExpandedAnimValue.value !== 0
    ) {
      isExpandedAnimValue.value = withSpring(0);
    }
    else if (
      e.contentOffset.y - prevTranslationYAnimValue.value < -scrollThreshold
            && isExpandedAnimValue.value !== 1
    ) {
      isExpandedAnimValue.value = withSpring(1);
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
