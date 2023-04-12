import 'react-native-gesture-handler';
import { useFonts } from 'expo-font'
import { useColorScheme } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { TamaguiProvider, Theme } from 'tamagui'
import config from './tamagui.config'
import { RootNavigator } from './src/navigation';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync()

export default () => {
  const colorScheme = useColorScheme()

  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    loaded && SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
        <NavigationContainer>
          <SafeAreaProvider>
            <RootNavigator />
          </SafeAreaProvider>
        </NavigationContainer>
      </Theme>
    </TamaguiProvider>
  );
}
