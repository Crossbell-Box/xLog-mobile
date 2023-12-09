import { createContext, useContext } from "react";
import type { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

import type { Language } from "../i18n";

interface GlobalStateContextType {
  homeFeed: {
    isExpandedAnimValue: SharedValue<number>
    onScroll: ReturnType<typeof useAnimatedScrollHandler>
  }
  language: Language
  setLanguage: (language: Language) => void
  dimensions: {
    width: number
    height: number
  }
}

export const GlobalStateContext = createContext<GlobalStateContextType | null>(null);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateContext");
  }
  return context;
};
