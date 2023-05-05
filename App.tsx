import "./shim";
import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import "@ethersproject/shims";
import "@walletconnect/react-native-compat";
import "expo-dev-client";
import "./error-handler";
import "@/providers/connect-kit-provider/setup-react-account";

import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze, enableScreens } from "react-native-screens";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import WalletConnectProvider from "@walletconnect/react-native-dapp";
import { resolveScheme } from "expo-linking";
import { TamaguiProvider } from "tamagui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProviderComposer from "@/components/ProviderComposer";
import { StatusBar } from "@/components/StatusBar";
import { ConnectKitProvider } from "@/providers/connect-kit-provider";
import { GlobalProvider } from "@/providers/global-provider";
import { NavigationProvider } from "@/providers/navigation-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { checkHotUpdates } from "@/utils/hot-updates";

import { RootNavigator } from "./src/navigation";
import { createAsyncStoragePersister } from "./src/utils/persister";
import config from "./tamagui.config";

enableScreens(true);
enableFreeze(true);

const persister = createAsyncStoragePersister();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

export default () => {
  useEffect(() => {
    checkHotUpdates();
  }, []);

  return (

    <ProviderComposer providers={[
      <GestureHandlerRootView key={"GestureHandlerRootView"} style={styles.container} />,
      <TamaguiProvider key={"TamaguiProvider"} config={config} />,
      <ErrorBoundary key={"ErrorBoundary"} />,
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
      <ConnectKitProvider key={"ConnectKitProvider"} />,
      <ThemeProvider key={"ThemeProvider"} />,
      <NavigationProvider key={"NavigationProvider"} />,
      <BottomSheetModalProvider key={"BottomSheetModalProvider"} />,
    ]}>
      <StatusBar />
      <RootNavigator />
    </ProviderComposer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
