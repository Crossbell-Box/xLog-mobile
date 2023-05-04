import type { FC } from "react";
import React, { useMemo } from "react";

import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useCurrentColor } from "tamagui";

export const NavigationProvider: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [
    primary,
    border,
    background,
  ] = ["color", "borderColor", "background"].map(useCurrentColor);

  const theme = useMemo(() => {
    DefaultTheme.colors = {
      ...DefaultTheme.colors,
      notification: primary,
      card: background,
      primary,
      border,
      background,
      text: primary,
    };

    return { ...DefaultTheme };
  }, [
    primary,
    border,
    background,
  ]);

  return (
    <NavigationContainer theme={theme}>
      {children}
    </NavigationContainer>
  );
};
