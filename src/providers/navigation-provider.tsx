import type { FC } from "react";
import React, { useCallback, useEffect, useMemo } from "react";

import type { LinkingOptions, NavigationState } from "@react-navigation/native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { OIA_HOST, APP_HOST } from "@/constants/env";
import { useColors } from "@/hooks/use-colors";
import { GA } from "@/utils/GA";
import { getActiveRoute } from "@/utils/get-active-route";

const prefix = Linking.createURL("/");

export const NavigationProvider: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { color, primary, background, borderColor } = useColors();
  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: [
      prefix,
      APP_HOST,
      OIA_HOST,
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
      GA.logEvent("open_app", {
        type: "deep_link",
        url,
      });
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

  const onStateChange = useCallback((state: NavigationState | undefined) => {
    const currentScreen = getActiveRoute(state);
    if (currentScreen) {
      GA.logScreenView({
        screen_class: currentScreen.name,
        screen_name: currentScreen.name,
      });
    }
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      theme={theme}
      onStateChange={onStateChange}
    >
      {children}
    </NavigationContainer>
  );
};
