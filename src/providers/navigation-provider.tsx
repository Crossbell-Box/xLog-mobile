import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";

import type { LinkingOptions } from "@react-navigation/native";
import { DefaultTheme, NavigationContainer, getActionFromState, getStateFromPath } from "@react-navigation/native";
import * as Linking from "expo-linking";

import { APP_HOST } from "@/constants/env";
import { useColors } from "@/hooks/use-colors";

const prefix = Linking.createURL("/");
export const NavigationProvider: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const fullPath = useRef<string>();
  const { color, primary, background, borderColor } = useColors();
  const linking: LinkingOptions<ReactNavigation.RootParamList> = {
    prefixes: [
      prefix,
      `https://${APP_HOST}`,
      `https://*.${APP_HOST}`,
    ],
    config: {
      screens: {
        Home: {
          screens: {
            Feed: "activities",
            Settings: "",
          },
        },
        PostDetails: {
          path: "api/redirection",
        },
      },
    },
    subscribe(listener) {
      const onReceiveURL = (options) => {
        const { url } = options;
        fullPath.current = url;
        // eslint-disable-next-line no-console
        console.log(url);
        return listener(url);
      };

      const disposer = Linking.addEventListener("url", onReceiveURL);

      return disposer.remove;
    },
    getStateFromPath(path, options) {
      const state = getStateFromPath(path, options);

      return state;
    },
    getActionFromState(state, options) {
      const action = getActionFromState(state, options);

      return action;
    },
  };

  // useEffect(() => {
  //   Linking.addEventListener("url", ({ url }) => {
  //     console.log("Deep link URL:", url);
  //   });
  // }, []);

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
