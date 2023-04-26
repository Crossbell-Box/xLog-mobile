import "./shim";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "@walletconnect/react-native-compat";
import "expo-dev-client";

import { useEffect } from "react";
import { useColorScheme, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze, enableScreens } from "react-native-screens";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { noopStorage } from "@wagmi/core";
import WalletConnectProvider from "@walletconnect/react-native-dapp";
import { useFonts } from "expo-font";
import { resolveScheme } from "expo-linking";
import * as SplashScreen from "expo-splash-screen";
import { TamaguiProvider, Theme } from "tamagui";
import { createClient, createStorage, WagmiConfig } from "wagmi";

import ProviderComposer from "@/components/ProviderComposer";
import { GlobalProvider } from "@/providers/global-provider";
import { Web3Provider } from "@/providers/web3-provider";
import { getDefaultClientConfig } from "@/utils/get-default-client-config";
import { checkHotUpdates } from "@/utils/hot-updates";

import { RootNavigator } from "./src/navigation";
import { createAsyncStoragePersister } from "./src/utils/persister";
import config from "./tamagui.config";

enableScreens(true);
enableFreeze(true);

SplashScreen.preventAutoHideAsync();

const persister = createAsyncStoragePersister();

const wagmiClient = createClient({
  ...getDefaultClientConfig({ appName: "xLog" }),
  persister,
  storage: createStorage({
    storage: noopStorage,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

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
            <ProviderComposer providers={[
              <GlobalProvider key={"GlobalProvider"} />,
              <SafeAreaProvider key={"SafeAreaProvider"} />,
              <PersistQueryClientProvider
                key={"PersistQueryClientProvider"}
                client={queryClient}
                persistOptions={{
                  persister,
                  dehydrateOptions: {
                    shouldDehydrateQuery: (query) => {
                      const queryIsReadyForPersistance = query.state.status === "success";
                      if (queryIsReadyForPersistance)
                        return !((query.state?.data as any)?.pages?.length > 1);

                      else
                        return false;
                    },
                  },
                }}
              />,
              <WagmiConfig key={"WagmiConfig"} client={wagmiClient} />,
              <WalletConnectProvider
                key={"WalletConnectProvider"}
                bridge="https://bridge.walletconnect.org"
                clientMeta={{
                  description: "Connect with WalletConnect",
                  url: "https://walletconnect.org",
                  icons: ["https://walletconnect.org/walletconnect-logo.png"],
                  name: "WalletConnect",
                }}
                redirectUrl={`${resolveScheme({})}://`}
                storageOptions={{
                  // @ts-expect-error: Internal
                  asyncStorage: AsyncStorage,
                }}
              />,
              <Web3Provider key={"Web3Provider"} />,
            ]}>
              <RootNavigator />
            </ProviderComposer>
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
