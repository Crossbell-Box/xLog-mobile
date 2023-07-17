import { useContext } from "react";

import { SplashContext } from "@/context/splash-context";

export function useSplash() {
  return useContext(SplashContext);
}
