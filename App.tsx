import './shim'
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import '@walletconnect/react-native-compat';

import { useFonts } from 'expo-font'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { TamaguiProvider, Theme } from 'tamagui'
import config from './tamagui.config'
import { RootNavigator } from './src/navigation';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient, WagmiConfig } from "wagmi"
import { getDefaultClientConfig } from '@/utils/get-default-client-config';
import { enableFreeze, enableScreens } from "react-native-screens";
import { checkHotUpdates } from '@/utils/hot-updates';

enableScreens(true);
enableFreeze(true);

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const wagmiClient = createClient(getDefaultClientConfig({ appName: 'xLog' }))

export default () => {
  const colorScheme = useColorScheme()

  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    loaded && SplashScreen.hideAsync()
  }, [loaded])

  useEffect(() => {
    checkHotUpdates()
  }, [])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={styles.container} >
      <TamaguiProvider config={config}>
        <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});