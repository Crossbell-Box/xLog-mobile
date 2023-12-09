import { type FC, type PropsWithChildren, useEffect } from "react";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

export const PreloadProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [fontsLoadingReady] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    InterLight: require("@tamagui/font-inter/otf/Inter-Light.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
  });

  const allReady = fontsLoadingReady;

  useEffect(() => {
    if (allReady) {
      SplashScreen.hideAsync();
    }
  }, [allReady]);

  if (!allReady)
    return null;

  return children;
};
