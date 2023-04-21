import "./shim";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "@walletconnect/react-native-compat";

import { useEffect } from "react";
import { useColorScheme, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze, enableScreens } from "react-native-screens";

import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { TamaguiProvider, Theme } from "tamagui";
import { createClient, WagmiConfig } from "wagmi";

import { getDefaultClientConfig } from "@/utils/get-default-client-config";
import { checkHotUpdates } from "@/utils/hot-updates";

import { RootNavigator } from "./src/navigation";
import config from "./tamagui.config";

enableScreens(true);
enableFreeze(true);

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const wagmiClient = createClient(getDefaultClientConfig({ appName: "xLog" }));

export default () => {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    loaded && SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    checkHotUpdates();
  }, []);

  if (!loaded)
    return null;

  return (
    <GestureHandlerRootView style={styles.container} >
      <TamaguiProvider config={config}>
        <Theme name={colorScheme === "dark" ? "dark" : "light"}>
          <NavigationContainer>
            <SafeAreaProvider>
              <WagmiConfig client={wagmiClient}>
                <QueryClientProvider client={queryClient}>
                  <RootNavigator />
                </QueryClientProvider>
              </WagmiConfig>
            </SafeAreaProvider>
          </NavigationContainer>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
