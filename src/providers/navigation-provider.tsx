import type { FC } from "react";
import React, { useEffect, useMemo } from "react";

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
        PostDetails: {
          path: "notes/:noteId/:characterId",
        },
      },
    },
  };

  useEffect(() => {
    const listener = Linking.addEventListener("url", ({ url }) => {
      // eslint-disable-next-line no-console
      console.log("Deep link URL:", url);
    });

    return () => {
      listener.remove();
    };
  }, []);

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
