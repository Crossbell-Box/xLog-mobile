import type { themes } from "@tamagui/themes";

export type Theme = "Official" | "Twitter";

export type Mode = "dark" | "light";

export type TamaguiTheme = typeof themes.light;

export type BaseTheme = Partial<TamaguiTheme> & {
  primary: string
  background: string
  backgroundStrong: string
  backgroundHover: string
  backgroundPress: string
  backgroundFocus: string
  backgroundTransparent: string
  borderColor: string
  borderColorHover: string
  borderColorPress: string
  borderColorFocus: string
  color: string
  colorHover: string
  colorPress: string
  colorFocus: string
  colorSubtitle: string
  colorDescription: string
  colorHint: string
  shadowColor: string
  shadowColorHover: string
  shadowColorPress: string
  shadowColorFocus: string
};
