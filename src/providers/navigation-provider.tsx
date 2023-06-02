import type { FC } from "react";
import React, { useMemo } from "react";

import type { LinkingOptions } from "@react-navigation/native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { APP_HOST } from "@/constants/env";
import { useColors } from "@/hooks/use-colors";

const prefix = Linking.createURL("/");

export const NavigationProvider: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { color, primary, background, borderColor } = useColors();
  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: [
      prefix,
      `https://${APP_HOST}`,
      `https://oia.${APP_HOST}`,
    ],
    config: {
      screens: {
        Home: {
          screens: {
            Feed: "",
          },
        },
        PostDetails: {
          path: "notes/:noteId/:characterId",
        },
      },
    },
  };

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
    <NavigationContainer linking={linking} theme={theme}>
      {children}
    </NavigationContainer>
  );
};
