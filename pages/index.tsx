import { StyleSheet } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import { WebView } from '../components/WebView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import React, { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export function App() {
  const { top } = useSafeAreaInsets()
  const webViewRef = React.useRef<RNWebView>(null!);
  const [lastCallTime, setLastCallTime] = useState(0);
  const startState = useSharedValue<GestureStateChangeEvent<PanGestureHandlerEventPayload>>(null)

  const injectedJavaScript = `
    (function() {
      const meta = document.createElement('meta');
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
      meta.setAttribute('name', 'viewport');
      document.getElementsByTagName('head')[0].appendChild(meta);

      const style = document.createElement('style');
      style.innerHTML = '#__next > header { padding-top: ${top}px !important; }';
      document.head.appendChild(style);
    })();
  `

  const goBack = useMemo(() => {
    return () => {
      const currentTime = Date.now();
      if (currentTime - lastCallTime > 1000) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        webViewRef.current.goBack();
        setLastCallTime(currentTime);
      }
    }
  }, [lastCallTime]);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      startState.value = e
    })
    .onEnd((e) => {
      if (
        startState.value?.absoluteX < 100 && e.translationX > 50 && e.translationY <= 100
      ) {
        runOnJS(goBack)()
      }
    })

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  return (
    <GestureDetector gesture={panGesture} >
      <Animated.View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          style={styles.container}
          source={{ uri: 'https://xlog.app/' }}
          injectedJavaScript={injectedJavaScript}
          onLoad={onLayoutRootView}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
