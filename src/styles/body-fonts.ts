import { config as tamaguiConfig } from "@tamagui/config";
import { createFont } from "@tamagui/core";

const nativeFaces = {
  400: { normal: "Inter" },
  500: { normal: "InterMedium" },
  600: { normal: "InterSemiBold" },
  700: { normal: "InterBold" },
  800: { normal: "InterExtraBold" },
  900: { normal: "InterBlack" },
};

const letterSpacings = {} as const;

export const bodyFont = createFont({
  ...tamaguiConfig.fonts.body,
  family: "Inter",
  letterSpacing: letterSpacings,
  face: nativeFaces,
});
