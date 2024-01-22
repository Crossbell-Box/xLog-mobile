import type { FC } from "react";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { StyleSheet, useWindowDimensions } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated, { runOnUI, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Image } from "expo-image";
import { Stack } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { WebView } from "@/components/WebView";
import { VERSION } from "@/constants";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useThemeStore } from "@/hooks/use-theme-store";
import { getParamsFromShortsURL } from "@/utils/get-params-from-shorts-url";

import { javaScriptBeforeContentLoaded } from "./javascript-before-content";
import { javaScriptContentLoaded } from "./javascript-content";
import { Skeleton } from "./Skeleton";

interface Props {
  headerContainerHeight: number
  postUri?: string
  bottomBarHeight: number
}

export interface WebViewRendererInstance {
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export const WebViewRenderer = forwardRef<WebViewRendererInstance, Props>(({ headerContainerHeight, postUri, bottomBarHeight }, ref) => {
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isDarkMode, mode } = useThemeStore();
  const navigation = useRootNavigation();
  const headerHeight = top + headerContainerHeight;
  const contentLoaderDimensions = { width, height: height - headerHeight };
  const [userAgent, setUserAgent] = React.useState<string>(null);
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);
  const webviewLoadingAnimValue = useSharedValue<number>(0);
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const renderLoading = useCallback(() => {
    return (
      <Stack position="absolute" flex={1} backgroundColor={backgroundColor} {...StyleSheet.absoluteFillObject}>
        <Skeleton webviewLoadingAnimValue={webviewLoadingAnimValue} headerHeight={0} />
      </Stack>
    );
  }, [webviewLoadingAnimValue, headerHeight]);

  const onWebViewMessage = (event) => {
    try {
      const { data } = event.nativeEvent;
      const { height, imageUrlArray, link, title } = JSON.parse(data);

      if (link) {
        const url = new URL(link);
        const params = getParamsFromShortsURL(url);
        const isPost = !!params;

        if (isPost) {
          navigation.push(
            "PostDetails",
            {
              slug: params.slug,
              handle: params.handle,
            },
          );
          return;
        }

        navigation.navigate("Web", {
          url: link,
          title,
        });
      }

      if (height) {
        setMaxContentHeight(Math.max(height, contentLoaderDimensions.height));
      }

      if (imageUrlArray) {
        setDisplayImageUris(imageUrlArray);
      }
    }
    catch (error) {
      console.warn(error);
    }
  };

  useEffect(() => {
    DeviceInfo.getUserAgent().then((ua) => {
      setUserAgent(`${ua} ReactNative/${VERSION}`);
    });
  }, []);

  const { height: screenHeight } = useWindowDimensions();
  const [maxContentHeight, setMaxContentHeight] = useState<number>(screenHeight);
  const animHeight = useSharedValue<number>(screenHeight);
  const animatedStyle = useAnimatedStyle(() => ({ height: animHeight.value }), []);

  const updateHeight = React.useCallback((offsetY) => {
    "worklet";
    const tolerance = 100;
    const isReachBottom = (offsetY + bottomBarHeight + headerContainerHeight) > (animHeight.value / 2);
    if (isReachBottom && animHeight.value < maxContentHeight) {
      animHeight.value += tolerance;
    }
  }, [maxContentHeight, bottomBarHeight, headerContainerHeight]);

  useImperativeHandle(ref, () => ({
    handleScroll: (e) => {
      runOnUI(updateHeight)(e.nativeEvent.contentOffset.y);
    },
  }), [updateHeight]);

  const closeModal = React.useCallback(() => setDisplayImageUris([]), []);

  return (
    <>
      <Animated.View style={animatedStyle}>
        {postUri && userAgent && (
          <WebView
            progressBarShown={false}
            userAgent={userAgent}
            source={{ uri: postUri }}
            containerStyle={styles.container}
            scrollEnabled={false}
            cacheEnabled
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            renderLoading={renderLoading}
            cacheMode="LOAD_CACHE_ELSE_NETWORK"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onMessage={onWebViewMessage}
            injectedJavaScript={javaScriptContentLoaded(bottomBarHeight, height)}
            injectedJavaScriptBeforeContentLoaded={javaScriptBeforeContentLoaded(mode)}
          />
        )}
      </Animated.View>
      {
        displayImageUris.length > 0 && (
          <ImageGallery
            isVisible={displayImageUris.length > 0}
            uris={displayImageUris}
            onClose={closeModal}
          />
        )
      }
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

