import "./shim";
import "intl-pluralrules";
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
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze, enableScreens } from "react-native-screens";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import WalletConnectProvider from "@walletconnect/react-native-dapp";
import { resolveScheme } from "expo-linking";
import * as Sentry from "sentry-expo";
import { TamaguiProvider } from "tamagui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProviderComposer from "@/components/ProviderComposer";
import { StatusBar } from "@/components/StatusBar";
import { IS_DEV } from "@/constants";
import { SENTRY_DSN } from "@/constants/env";
import { ConnectKitProvider } from "@/providers/connect-kit-provider";
import { DrawerProvider } from "@/providers/drawer-provider";
import LoadingProvider from "@/providers/loading-provider";
import { NavigationProvider } from "@/providers/navigation-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { checkHotUpdates } from "@/utils/hot-updates";

import { RootNavigator } from "./src/navigation";
import { createAsyncStoragePersister } from "./src/utils/persister";
import config from "./tamagui.config";

enableScreens(true);
enableFreeze(true);

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: IS_DEV,
});

// eslint-disable-next-line no-console
console.log("Sentry init config: ", {
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: IS_DEV,
});

const persister = createAsyncStoragePersister();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24,
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
      <LoadingProvider key={"LoadingProvider"} />,
      <NavigationProvider key={"NavigationProvider"} />,
      <BottomSheetModalProvider key={"BottomSheetModalProvider"} />,
      <DrawerProvider key={"DrawerProvider"}/>,
      <ToastProvider key={"ToastProvider"} />,
      // @ts-expect-error: Internal
      <KeyboardProvider key={"KeyboardProvider"}/>,
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
