import { createContext } from "react";

import type { Mode, Theme } from "@/styles/theme/types";

interface IThemeContext {
  mode: Mode
  theme: Theme
  followSystem: boolean
  toggleMode: () => void
  changeTheme: (theme: Theme) => void
  toggleFollowSystem: () => void
  isDarkMode: boolean
}

export const ThemeContext = createContext<IThemeContext>(null!);

