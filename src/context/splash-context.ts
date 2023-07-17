import { createContext } from "react";

interface SplashContextType {
  isSplashVisible: boolean
  hideSplash: () => void
}

export const SplashContext = createContext<SplashContextType | null>(null);
