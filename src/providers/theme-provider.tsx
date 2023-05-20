import type { FC, PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Theme as TamaguiTheme } from "tamagui";

import { ThemeContext } from "@/context/theme-context";
import type { Mode, Theme } from "@/styles/theme/types";

SplashScreen.preventAutoHideAsync();

const defaultTheme: Theme = "official";
const defaultMode: Mode = "dark";

const STORAGE_THEME_KEY = "THEME_KEY"; // OFFICIAL | COMMUNITY_01 | COMMUNITY_02 | ...
const STORAGE_MODE_KEY = "MODE_KEY"; // DARK | LIGHT (Currently only support dark or light.)
const FOLLOW_SYSTEM_KEY = "FOLLOW_SYSTEM";

export const ThemeProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>();
  const [mode, setMode] = useState<Mode>();
  const [followSystem, setFollowSystem] = useState<boolean>();
  const storageThemeStorage = useAsyncStorage(STORAGE_THEME_KEY);
  const storageModeStorage = useAsyncStorage(STORAGE_MODE_KEY);
  const followSystemStorage = useAsyncStorage(FOLLOW_SYSTEM_KEY);
  const [loading, setLoading] = useState(true);

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    InterLight: require("@tamagui/font-inter/otf/Inter-Light.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
  });

  useEffect(() => {
    loaded && SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const theme = await storageThemeStorage.getItem() as Theme;
      setTheme(theme || defaultTheme);

      const mode = await storageModeStorage.getItem() as Mode;
      setMode(mode || defaultMode);

      const followSystem = await followSystemStorage.getItem() as String === "true";
      setFollowSystem(followSystem || false);
    })()
      .catch((err) => {
        console.error(err);
        setTheme(defaultTheme);
        setMode(defaultMode);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleMode = useCallback(() => {
    const _mode = mode === "dark" ? "light" : "dark";

    setMode(_mode);
    storageModeStorage.setItem(_mode);
  }, [mode]);

  const changeTheme = useCallback((theme: Theme) => {
    setTheme(theme);
    storageThemeStorage.setItem(theme);
  }, []);

  const toggleFollowSystem = useCallback(async () => {
    const _followSystem = !followSystem;

    setFollowSystem(_followSystem);
    await followSystemStorage.setItem(String(_followSystem));

    if (_followSystem) {
      setMode(colorScheme);
      await storageModeStorage.setItem(colorScheme);
    }
  }, [followSystem, colorScheme]);

  const isDarkMode = mode === "dark";

  if (!loaded)
    return null;

  return (
    <ThemeContext.Provider value={{
      mode,
      theme,
      isDarkMode,
      followSystem,
      toggleFollowSystem,
      toggleMode,
      changeTheme,
    }}>
      <TamaguiTheme name={`${theme}_${mode}`}>
        {!loading && children}
      </TamaguiTheme>
    </ThemeContext.Provider>
  );
};
