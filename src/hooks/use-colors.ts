import { useCallback } from "react";

import { useTheme } from "tamagui";

export const useColors = () => {
  const theme = useTheme();

  const pick = useCallback((key: keyof typeof theme) => theme[key].val, [theme]);

  return {
    pick,
    color: theme.color.val,
    primary: theme.primary.val,
    background: theme.background.val,
    borderColor: theme.borderColor.val,
    backgroundFocus: theme.backgroundFocus.val,
    subtitle: theme.colorSubtitle.val,
    description: theme.colorDescription.val,
  };
};
