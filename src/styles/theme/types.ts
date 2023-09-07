import type { themes } from "@tamagui/themes";

export type Theme = "Official";

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
  homeFeedBackgroundGradient_0: string
  homeFeedBackgroundGradient_1: string
  cardBackground: string
  bottomSheetBackground: string

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
  colorUnActive: string
  shadowColor: string
  shadowColorHover: string
  shadowColorPress: string
  shadowColorFocus: string
};
