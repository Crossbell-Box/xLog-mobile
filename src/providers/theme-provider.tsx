import type { FC, PropsWithChildren } from "react";
import { useCallback } from "react";
import { useColorScheme } from "react-native";

import { useFonts } from "expo-font";
import { Theme as TamaguiTheme } from "tamagui";

import { ThemeContext } from "@/context/theme-context";
import { useStorage } from "@/hooks/use-storage";
import { allThemes } from "@/styles/theme";
import type { Mode, Theme } from "@/styles/theme/types";

const defaultTheme: Theme = "Official";
const defaultMode: Mode = "dark";

const STORAGE_THEME_KEY = "THEME_KEY"; // OFFICIAL | COMMUNITY_01 | COMMUNITY_02 | ...
const STORAGE_MODE_KEY = "MODE_KEY"; // DARK | LIGHT (Currently only support dark or light.)
const FOLLOW_SYSTEM_KEY = "FOLLOW_SYSTEM";

export const ThemeProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const colorScheme = useColorScheme();

  const [theme, setTheme] = useStorage<Theme>(STORAGE_THEME_KEY, {
    validationValues: allThemes.map(i => i.themeName),
    defaultValue: defaultTheme,
  });

  const [mode, setMode] = useStorage<Mode>(STORAGE_MODE_KEY, {
    validationValues: ["dark", "light"],
    defaultValue: defaultMode,
  });

  const [followSystem, setFollowSystem] = useStorage<boolean>(FOLLOW_SYSTEM_KEY, {
    defaultValue: false,
  });

  const toggleMode = useCallback(() => {
    const _mode = mode === "dark" ? "light" : "dark";

    setMode(_mode);
  }, [mode]);

  const changeTheme = useCallback((theme: Theme) => {
    setTheme(theme);
  }, []);

  const toggleFollowSystem = useCallback(() => {
    const _followSystem = !followSystem;

    setFollowSystem(_followSystem);

    if (_followSystem) {
      setMode(colorScheme);
    }
  }, [followSystem, colorScheme]);

  const isDarkMode = mode === "dark";

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
        {children}
      </TamaguiTheme>
    </ThemeContext.Provider>
  );
};
