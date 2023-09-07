import officialTheme from "./official-theme";
import type { BaseTheme } from "./types";
import { composeThemes } from "./utils";

export const allThemes = [
  officialTheme,
];

const composedThemes = composeThemes(allThemes);

type ThemeName = keyof typeof composedThemes;

type Themes = {
  [key in ThemeName]: BaseTheme
};

export const themes: Themes = composedThemes;
