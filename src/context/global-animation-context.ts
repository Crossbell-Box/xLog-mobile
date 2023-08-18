import { createContext } from "react";
import type { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

interface GlobalAnimationContextType {
  homeFeed: {
    isExpandedAnimValue: SharedValue<number>
    onScroll: ReturnType<typeof useAnimatedScrollHandler>
  }
}

export const GlobalAnimationContext = createContext<GlobalAnimationContextType | null>(null);
