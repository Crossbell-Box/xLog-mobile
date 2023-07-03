import type { FC } from "react";
import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { WebViewMessageEvent } from "react-native-webview";
import { WebView } from "react-native-webview";

import { useAccountState } from "@crossbell/react-account";
import { useRefCallback } from "@crossbell/util-hooks";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack, Spinner } from "tamagui";

import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
}

export const EmailLoginPage: FC<NativeStackScreenProps<RootStackParamList, "Web">> = (props) => {
  const { navigation } = props;
  const { isDarkMode } = useThemeStore();
  const webViewRef = React.useRef<WebView>(null);
  const [isReady, setIsReady] = React.useState(false);

  const updateColorScheme = useRefCallback(() => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: "update-color-scheme",
      mode: isDarkMode ? "dark" : "light",
    }));
  });

  React.useEffect(updateColorScheme, [isDarkMode]);

  const handleMessage = useRefCallback((event: WebViewMessageEvent) => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.type === "connected" && data.token) {
      useAccountState.getState().connectEmail(data.token).then(() => {
        navigation.goBack();
      });
    }
  });

  const handleWebViewLoad = useRefCallback(() => {
    setIsReady(true);
  });

  const viewStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isReady ? 1 : 0, { duration: 300 }),
    };
  }, [isReady]);

  const loadingStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isReady ? 0 : 1, { duration: 300 }),
    };
  }, [isReady]);

  return (
    <Stack flex={1}>
      <Animated.View style={[styles.loading, loadingStyles]}>
        <Spinner size="large" />
      </Animated.View>
      <Animated.View style={[styles.container, viewStyles]}>
        <WebView
          ref={webViewRef}
          scrollEnabled={false}
          source={{ uri: "https://f.crossbell.io/mobile-login" }}
          onMessage={handleMessage}
          style={styles.webview}
          onLoadEnd={handleWebViewLoad}
          injectedJavaScript={`window.document.documentElement.classList.add('${isDarkMode ? "dark" : "light"}')`}
        />
      </Animated.View>
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
  },
  webview: {
    backgroundColor: "transparent",
  },
  loading: {
    position: "absolute",
    width: "50%",
    height: "50%",
    top: "25%",
    left: "25%",
  },
});
