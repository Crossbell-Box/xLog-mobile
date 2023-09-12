import "./shim";
import "expo-dev-client";
import "./error-handler";
import "@/providers/connect-kit-provider/setup-react-account";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableFreeze, enableScreens } from "react-native-screens";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as Sentry from "sentry-expo";
import type { SentryExpoNativeOptions } from "sentry-expo";
import { TamaguiProvider } from "tamagui";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkChecker } from "@/components/NetworkChecker";
import { NetworkSafeView } from "@/components/NetworkSafeView";
import { NotificationRegister } from "@/components/NotificationRegister";
import ProviderComposer from "@/components/ProviderComposer";
import { StatusBar } from "@/components/StatusBar";
import { WalletConnectModal } from "@/components/WalletConnectModal";
import { ENV, SENTRY_DSN } from "@/constants/env";
import { i18n } from "@/i18n";
import { ApolloProvider } from "@/providers/apollo-provider";
import { ConnectKitProvider } from "@/providers/connect-kit-provider";
import { DrawerProvider } from "@/providers/drawer-provider";
import { GlobalAnimationProvider } from "@/providers/global-animation-provider";
import LoadingProvider from "@/providers/loading-provider";
import { NavigationProvider } from "@/providers/navigation-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { PostIndicatorProvider } from "@/providers/post-indicator-provider";
import { SplashProvider } from "@/providers/splash-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { checkHotUpdates } from "@/utils/hot-updates";

import { version } from "./package.json";
import { RootNavigator } from "./src/navigation/root";
import { createAsyncStoragePersister } from "./src/utils/persister";
import config from "./tamagui.config";

enableScreens(true);
enableFreeze(true);

if (!__DEV__) {
  const SENTRY_CONFIG: SentryExpoNativeOptions = {
    dsn: SENTRY_DSN,
    enableInExpoDevelopment: true,
    debug: __DEV__,
    attachScreenshot: true,
    environment: ENV,
  };

  Sentry.init(SENTRY_CONFIG);
  Sentry.Native.setTag("version", version);

  // eslint-disable-next-line no-console
  console.log("Sentry init config: ", SENTRY_CONFIG);
}

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
    checkHotUpdates().catch(() => { });
  }, []);

  return (
    <ProviderComposer providers={[
      <GestureHandlerRootView key={"GestureHandlerRootView"} style={styles.container} />,
      <TamaguiProvider key={"TamaguiProvider"} config={config} />,
      <SplashProvider key={"SplashProvider"}/>,
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
      <I18nextProvider key={"I18nextProvider"} i18n={i18n} />,
      <ToastProvider key={"ToastProvider"} />,
      <ConnectKitProvider key={"ConnectKitProvider"} />,
      <ThemeProvider key={"ThemeProvider"} />,
      <LoadingProvider key={"LoadingProvider"} />,
      <NavigationProvider key={"NavigationProvider"} />,
      <BottomSheetModalProvider key={"BottomSheetModalProvider"} />,
      <DrawerProvider key={"DrawerProvider"} />,
      // @ts-expect-error: Internal
      <KeyboardProvider key={"KeyboardProvider"} />,
      <NotificationProvider key={"NotificationProvider"} />,
      <ApolloProvider key={"ApolloProvider"} />,
      <GlobalAnimationProvider key={"GlobalAnimationProvider"} />,
      <PostIndicatorProvider key={"PostIndicatorProvider"} />,
    ]}>
      <NetworkChecker/>
      <NotificationRegister/>
      <StatusBar />
      <RootNavigator />
      <NetworkSafeView ifReachable={<WalletConnectModal />}/>
    </ProviderComposer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
