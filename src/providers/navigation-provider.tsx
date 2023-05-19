import type { FC } from "react";
import React, { useMemo } from "react";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";

import { useColors } from "@/hooks/use-colors";

export const NavigationProvider: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { color, primary, background, borderColor } = useColors();

  const theme = useMemo(() => {
    DefaultTheme.colors = {
      ...DefaultTheme.colors,
      notification: color,
      card: background,
      primary: color,
      border: borderColor,
      background,
      text: color,
    };

    return { ...DefaultTheme };
  }, [
    primary,
    color,
    borderColor,
    background,
  ]);

  return (
    <NavigationContainer theme={theme}>
      {children}
    </NavigationContainer>
  );
};
