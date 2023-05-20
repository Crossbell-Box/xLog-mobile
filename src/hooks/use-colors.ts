import { useTheme } from "tamagui";

export const useColors = () => {
  const theme = useTheme();

  return {
    color: theme.color.val,
    primary: theme.primary.val,
    background: theme.background.val,
    borderColor: theme.borderColor.val,
    backgroundFocus: theme.backgroundFocus.val,
    subtitle: theme.colorSubtitle.val,
    description: theme.colorDescription.val,
  };
};
