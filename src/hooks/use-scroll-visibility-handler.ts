import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useAnimatedScrollHandler, useSharedValue, withSpring } from "react-native-reanimated";

interface Options {
  scrollThreshold: number
}

export function useScrollVisibilityHandler(options: Options) {
  const { scrollThreshold } = options;
  const prevTranslationYAnimValue = useSharedValue<number>(0);
  const isExpandedAnimValue = useSharedValue<0 | 1>(1);

  const onScroll = useAnimatedScrollHandler((event) => {
    if (isExpandedAnimValue.value !== 0 && isExpandedAnimValue.value !== 1)
      return;

    if (
      event.contentOffset.y - prevTranslationYAnimValue.value > scrollThreshold
            && isExpandedAnimValue.value !== 0
    ) {
      isExpandedAnimValue.value = withSpring(0);
    }
    else if (
      event.contentOffset.y - prevTranslationYAnimValue.value < -scrollThreshold
            && isExpandedAnimValue.value !== 1
    ) {
      isExpandedAnimValue.value = withSpring(1);
    }
  }, [scrollThreshold]);

  const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    prevTranslationYAnimValue.value = e.nativeEvent.contentOffset.y;
  };

  return { onScroll, onScrollEndDrag, isExpandedAnimValue };
}
