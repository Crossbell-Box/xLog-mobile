import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withTiming, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import ContentLoader, { Rect } from "react-content-loader/native";
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

export interface Props {
  noteId: number
  characterId: number
  navigation: NativeStackNavigationProp<RootStackParamList, "PostDetails", undefined>
  scrollEventHandler: ReturnType<typeof useScrollVisibilityHandler>
  headerContainerHeight: number
  bottomBarHeight: number
}

const { width } = Dimensions.get("window");

export const Content: FC<Props> = (props) => {
  const { noteId, characterId, navigation, scrollEventHandler, bottomBarHeight, headerContainerHeight } = props;
  const { background } = useColors();
  const { isDarkMode, mode } = useThemeStore();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const { t } = useTranslation("site");
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);

  const webviewUri = useMemo(() => {
    const externalUrl = note.data?.metadata?.content?.external_urls?.[0];
    if (!externalUrl) return null;
    const pathname = new URL(externalUrl).pathname;
    const webviewUrl = new URL(`/site/${character?.data?.handle}${pathname}`, `https://${DOMAIN}`);
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

  const skeletonAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(webviewLoadingAnimValue.value, [0, 1], [1, 0]),
    };
  }, []);

  const webviewAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(webviewLoadingAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  useEffect(() => {
    webviewLoadingAnimValue.value = withTiming(1, { duration: 300 });
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
            <Animated.View style={[
              webviewAnimStyles,
              styles.webviewContainer,
              { height: webviewHeight, paddingTop: headerContainerHeight },
            ]}>
              {webviewUri && (
                <WebView
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
                  injectedJavaScriptBeforeContentLoaded={`
                      const xlogConfigurationKey = 'xlog';
                      const originalXLogStorageData = JSON.parse(localStorage.getItem(xlogConfigurationKey)||"{}");
                      originalXLogStorageData['darkMode'] = JSON.stringify(${isDarkMode});
                      localStorage.setItem(xlogConfigurationKey, JSON.stringify(originalXLogStorageData));
                      document.cookie = "color_scheme=${mode};";
                    `}
                  injectedJavaScript={`
                      function handleImageClick(event) {
                        const allImageUrls = Array.from(document.getElementsByTagName('img')).map(img => img.src);
                        const clickedImageUrl = event.target.src;
                        const imageUrlSet = new Set([clickedImageUrl, ...allImageUrls]);
                        const imageUrlArray = Array.from(imageUrlSet);
                    
                        window.ReactNativeWebView.postMessage(
                          JSON.stringify({
                            imageUrlArray
                          })
                        );
                      }
                    
                      function sendHeight() {
                        window.ReactNativeWebView.postMessage(
                          JSON.stringify({
                            height: Math.max(document.body.scrollHeight + ${bottomBarHeight}, ${height})
                          })
                        );
                      }
                      
                      window.addEventListener("load", function() {
                        setTimeout(sendHeight, 1000); // TODO: find a better way to do this 🔴 

                        const images = document.getElementsByTagName('img');
                        for (let i = 0; i < images.length; i++) {
                          images[i].addEventListener('click', handleImageClick);
                        }

                        const links = document.getElementsByTagName('a');
                        for (let i = 0; i < links.length; i++) {
                          links[i].addEventListener('click', function(event) {
                            event.preventDefault();
                            window.ReactNativeWebView.postMessage(
                              JSON.stringify({
                                link: event.target.href
                              })
                            );
                          });
                        }
                      });

                      const observer = new MutationObserver(sendHeight);
                      observer.observe(document.body, {
                        attributes: true, 
                        childList: true, 
                        subtree: true 
                      });
                    `}
                />
              )}
            </Animated.View>
            {
              !webviewLoaded && (
                <Animated.View
                  style={[skeletonAnimStyles, {
                    height: height - headerHeight,
                    backgroundColor: background,
                    top: headerHeight,
                    position: "absolute",
                    width: "100%",
                  }]}
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(1000)}
                >
                  <YStack height={contentLoaderDimensions.height} alignItems={"flex-start"} justifyContent={"flex-start"}>
                    <ContentLoader
                      viewBox={`0 0 ${contentLoaderDimensions.width - 10 * 2} 
                        ${contentLoaderDimensions.height}`}
                      backgroundColor={"gray"}
                      opacity="0.3"
                    >
                      <Rect x="10" y="20" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40) * 0.5}`} height="36" />
                      <Rect x="10" y="70" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40) * 0.25}`} height="13" />
                      <Rect x={`${10 + (contentLoaderDimensions.width - 40) * 0.25 + 10}`} y="70" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40) * 0.35}`} height="13" />
                      <Rect x="10" y="100" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40) * 0.75}`} height="20" />
                      <Rect x="10" y="130" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40)}`} height="20" />
                      <Rect x="10" y="160" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40)}`} height="20" />
                      <Rect x="10" y="190" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40)}`} height="20" />
                      <Rect x="10" y="220" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40)}`} height="20" />
                      <Rect x="10" y="250" rx="3" ry="3" width={`${(contentLoaderDimensions.width - 40) * 0.75}`} height="20" />
                    </ContentLoader>
                  </YStack>
                </Animated.View>
              )
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
