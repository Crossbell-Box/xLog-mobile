import { themes as _themes } from "@tamagui/themes";
import { createTheme } from "tamagui";

import type { BaseTheme, Mode, TamaguiTheme, Theme } from "./types";

export const defineTheme = <T extends string>(
  themeName: T,
  definitions: Array<{
    mode: Mode
    token: (theme: TamaguiTheme) => BaseTheme
  }>,
) => {
  return {
    themeName,
    definitions: definitions.reduce((acc, { mode, token }) => {
      const t = mode === "dark" ? _themes.dark : _themes.light;
      return {
        ...acc,
        [mode]: createTheme(token(t)),
      };
    }, {} as Record<Mode, BaseTheme>),
  } as const;
};

export const composeThemes = (
  definitions: Array<ReturnType<typeof defineTheme>>,
) => {
  return definitions.reduce((acc, { themeName, definitions }) => {
    return {
      ...acc,
      [`${themeName}_dark`]: definitions.dark,
      [`${themeName}_light`]: definitions.light,
    };
  }, {} as Record<`${Theme}_${Mode}`, BaseTheme>);
};
