import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { runtimeVersion } from "expo-updates";
import { H2, Spacer, useWindowDimensions, YStack } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { WebView } from "@/components/WebView";
import { DOMAIN } from "@/constants";
import { IPFS_GATEWAY } from "@/constants/env";
import { PageNotFound } from "@/constants/resource";
import { useColors } from "@/hooks/use-colors";
import type { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPage } from "@/queries/page";
import { getNoteSlug } from "@/utils/get-slug";

import { javascriptContent } from "./javascript-before-content-loaded";
import { javaScriptBeforeContentLoaded } from "./javascript-content";
import { Skeleton } from "./Skeleton";

export interface Props {
  noteId: number
  characterId: number
  navigation: NativeStackNavigationProp<RootStackParamList, "PostDetails", undefined>
  scrollEventHandler: ReturnType<typeof useScrollVisibilityHandler>
  headerContainerHeight: number
  bottomBarHeight: number
  headerComponent?: React.ReactNode
}

const { width } = Dimensions.get("window");

export const Content: FC<Props> = (props) => {
  const { noteId, headerComponent, characterId, navigation, scrollEventHandler, bottomBarHeight, headerContainerHeight } = props;
  const { background } = useColors();
  const { isDarkMode, mode } = useThemeStore();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const { t } = useTranslation("site");
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);

  const webviewUri = useMemo(() => {
    const slug = getNoteSlug(note.data);

    if (!slug) return null;
    const webviewUrl = new URL(`/site/${character?.data?.handle}/${slug}`, `https://${DOMAIN}`);
    webviewUrl.search = new URLSearchParams({
      "only-content": "true",
    }).toString();
    return webviewUrl.toString();
  }, [note]);

  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note.data),
      useStat: true,
    },
  );

  const pageIsNotFound = useMemo(() => {
    if (page.isLoading || page.isError || !page.data) {
      return false;
    }

    return (new Date(page?.data?.metadata?.content?.date_published || "") > new Date()
    );
  }, [page]);

  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const headerHeight = top + headerContainerHeight;
  const contentLoaderDimensions = { width, height: headerHeight + 200 };
  const webviewLoadingAnimValue = useSharedValue<number>(0);
  const followAnimValue = useSharedValue<number>(0);
  const [webviewLoaded, setWebviewLoaded] = React.useState(false);
  const [webviewHeight, setWebviewHeight] = React.useState(contentLoaderDimensions.height);
  const { ...scrollVisibilityHandler } = scrollEventHandler;
  const [userAgent, setUserAgent] = React.useState<string>(null);

  const onWebViewMessage = (event) => {
    try {
      const { data } = event.nativeEvent;
      const { height, imageUrlArray, link } = JSON.parse(data);

      if (link) {
        navigation.navigate("Web", { url: link });
      }

      if (height) {
        setWebviewHeight(Math.max(height, contentLoaderDimensions.height));
        setWebviewLoaded(true);
      }

      if (imageUrlArray) {
        setDisplayImageUris(imageUrlArray);
      }
    }
    catch (error) {
      console.warn(error);
    }
  };

  const closeModal = React.useCallback(() => {
    setDisplayImageUris([]);
  }, []);

  useEffect(() => {
    followAnimValue.value = withDelay(1500, withSpring(1));
  }, []);

  useEffect(() => {
    DeviceInfo.getUserAgent().then((us) => {
      setUserAgent(`${us} ReactNative/${runtimeVersion}`);
    });
  }, []);

  const webviewAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(webviewLoadingAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  useEffect(() => {
    if (webviewLoaded) {
      webviewLoadingAnimValue.value = withTiming(1, { duration: 300 });
    }
  }, [webviewLoaded]);

  return (
    <>
      {pageIsNotFound
        ? (
          <YStack paddingTop={headerHeight + 50} paddingHorizontal="$4" alignItems="center">
            <H2>{t("404 - Whoops, this page is gone.")}</H2>
            <Spacer size={100} />
            <Image source={PageNotFound} contentFit={"contain"} style={styles.notFound} />
          </YStack>
        )
        : (
          <Animated.ScrollView
            bounces={false}
            {...scrollVisibilityHandler}
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: bottomBarHeight }}
            scrollEventThrottle={16}
            scrollIndicatorInsets={{
              top: headerHeight - top,
              bottom: bottomBarHeight - bottom,
            }}
          >
            {headerComponent}
            <Animated.View style={[
              webviewAnimStyles,
              styles.webviewContainer,
              { height: webviewHeight },
            ]}>
              {webviewUri && userAgent && (
                <WebView
                  userAgent={userAgent}
                  source={{ uri: webviewUri }}
                  style={[styles.webview, { backgroundColor: isDarkMode ? "black" : "white" }]}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  onMessage={onWebViewMessage}
                  onShouldStartLoadWithRequest={(request) => {
                    if (request.url.startsWith(IPFS_GATEWAY)) {
                      return false;
                    }

                    if (request.url === webviewUri) return true;

                    return false;
                  }}
                  injectedJavaScriptBeforeContentLoaded={javaScriptBeforeContentLoaded(
                    isDarkMode,
                    mode,
                  )}
                  injectedJavaScript={javascriptContent(
                    bottomBarHeight,
                    height,
                  )}
                />
              )}
            </Animated.View>
            {
              !webviewLoaded && <Skeleton webviewLoadingAnimValue={webviewLoadingAnimValue} headerHeight={headerHeight} />
            }
          </Animated.ScrollView>
        )}

      <ImageGallery
        isVisible={displayImageUris.length > 0}
        uris={displayImageUris}
        onClose={closeModal}
      />
    </>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  notFound: {
    width: width * 0.7,
    height: width * 0.7,
  },
});
