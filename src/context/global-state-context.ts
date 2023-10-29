import { createContext, useContext } from "react";
import type { SharedValue, useAnimatedScrollHandler } from "react-native-reanimated";

import type { Country } from "@/constants/countries";

interface GlobalStateContextType {
  homeFeed: {
    isExpandedAnimValue: SharedValue<number>
    onScroll: ReturnType<typeof useAnimatedScrollHandler>
  }
  isChinese: boolean
  country: Country
  setCountry: (country: Country) => void
}

export const GlobalStateContext = createContext<GlobalStateContextType | null>(null);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateContext");
  }
  return context;
};
