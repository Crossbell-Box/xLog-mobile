import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withTiming, interpolateColor, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import ContentLoader, { Rect } from "react-content-loader/native";
import { H2, H4, Spacer, Stack, useWindowDimensions, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { BlockchainInfoIcon } from "@/components/BlockchainInfoIcon";
import { ImageGallery } from "@/components/ImageGallery";
import { ReactionLike } from "@/components/ReactionLike";
import { ReactionMint } from "@/components/ReactionMint";
import { WebView } from "@/components/WebView";
import { DOMAIN } from "@/constants";
import { IPFS_GATEWAY } from "@/constants/env";
import { PageNotFound } from "@/constants/resource";
import { useColors } from "@/hooks/use-colors";
import { useFollow } from "@/hooks/use-follow";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPage } from "@/queries/page";
import { useGetSite } from "@/queries/site";
import { getNoteSlug } from "@/utils/get-slug";

export interface Props {
  noteId: number
  characterId: number
}

const { width } = Dimensions.get("window");

export const PostDetailsPage: FC<NativeStackScreenProps<RootStackParamList, "PostDetails">> = (props) => {
  const { route, navigation } = props;
  const { params } = route;
  const avatarSize = 30;
  const { background, backgroundFocus, primary } = useColors();
  const { isDarkMode, mode } = useThemeStore();
  const note = useNote(params.characterId, params.noteId);
  const character = useCharacter(params.characterId);
  const site = useGetSite(character.data?.handle);
  const { t } = useTranslation("site");
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);
  const { isFollowing, isLoading, toggleSubscribe } = useFollow({ character: character?.data });

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
  const bottomBarHeight = bottom + 45;
  const headerContainerHeight = 45;
  const headerHeight = top + headerContainerHeight;
  const contentLoaderDimensions = { width, height: headerHeight + 200 };
  const webviewLoadingAnimValue = useSharedValue<number>(0);
  const followAnimValue = useSharedValue<number>(0);
  const [webviewLoaded, setWebviewLoaded] = React.useState(false);
  const [webviewHeight, setWebviewHeight] = React.useState(contentLoaderDimensions.height);
  const {
    isExpandedAnimValue,
    ...scrollVisibilityHandler
  } = useScrollVisibilityHandler({ scrollThreshold: 30 });

  const reactionCommonProps = {
    characterId: note?.data?.characterId,
    noteId: note?.data?.noteId,
  };

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

  const titleAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isExpandedAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  const headerBgAnimStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(isExpandedAnimValue.value, [0, 1], ["transparent", background]),
    };
  }, [background]);

  const followContainerAnimStyle = useAnimatedStyle(() => {
    return {
      paddingRight: interpolate(followAnimValue.value, [0, 1], [0, 10]),
      width: interpolate(followAnimValue.value, [0, 1], [avatarSize, avatarSize * 2 + 5]),
    };
  }, []);

  const subscribeAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(followAnimValue.value, [0, 0.3, 0.7, 1], [1, 0.7, 1.3, 1]),
        }, {
          rotateZ: `${interpolate(followAnimValue.value, [0, 0.3, 1], [0, 45, 0])}deg`,
        },
      ] as any,
      zIndex: 2,
    };
  }, []);

  const backBtnAnimStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(isExpandedAnimValue.value, [0, 1], [backgroundFocus, background]),
    };
  }, [background, primary]);

  const handleToggleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSubscribe();
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
      <Stack flex={1} backgroundColor={"$background"}>
        <Animated.View style={[{
          paddingTop: top + 5,
          height: headerHeight,
          width: "100%",
          position: "absolute",
          zIndex: 2,
        }, headerBgAnimStyles]}>
          <TouchableWithoutFeedback onPress={navigation.goBack} containerStyle={{
            position: "absolute",
            left: 8,
            top: top + 5,
            zIndex: 2,
          }}>
            <Animated.View style={[backBtnAnimStyle, {
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 50,
            }]}>
              <ArrowLeft width={30} />
            </Animated.View>
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.headerContainer, titleAnimStyles]}>
            <XStack width={"70%"} justifyContent="center" alignItems="center">
              <H4 textAlign="center" numberOfLines={1}>
                {note.data?.metadata?.content?.title}
              </H4>
            </XStack>
          </Animated.View>
          <Animated.View
            style={[
              {
                borderRadius: 50,
                width: 35,
                height: 35,
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                right: 8,
                top: top + 5,
                zIndex: 2,
              },
              titleAnimStyles,
            ]}
          >
            <BlockchainInfoIcon page={page?.data} site={site?.data}/>
          </Animated.View>
        </Animated.View>
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
                            height: Math.max(document.body.scrollHeight + ${height * 0.2}, ${height})
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
                      <ContentLoader viewBox={`0 0 ${contentLoaderDimensions.width - 10 * 2} ${contentLoaderDimensions.height}`} backgroundColor={"gray"} opacity="0.3">
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
        {/* Bottom Bar */}
        <XStack
          width={"100%"}
          bottom={0}
          position="absolute"
          backgroundColor={"$background"}
          height={bottomBarHeight}
          borderTopColor={"$borderColor"}
          borderTopWidth={1}
          paddingHorizontal={"$5"}
          paddingTop={"$1"}
        >
          <XStack width={"100%"} height={"$4"} justifyContent="space-between" alignItems="center">
            <Animated.View style={[followContainerAnimStyle, {
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 50,
              backgroundColor: isFollowing ? backgroundFocus : primary,
              flexDirection: "row",
              overflow: "hidden",
              borderColor: "white",
            }]} >
              <Avatar useDefault size={avatarSize} character={character.data} />
              <TouchableWithoutFeedback onPress={handleToggleSubscribe} hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }} >
                <Animated.View style={subscribeAnimStyle}>
                  {
                    isFollowing
                      ? (
                        <UserMinus width={16} disabled={isLoading} />
                      )
                      : (
                        <UserPlus size={16} disabled={isLoading}/>
                      )
                  }
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
            <XStack>
              {
                !pageIsNotFound && (
                  <>
                    <ReactionLike {...reactionCommonProps} />
                    <Spacer size="$4" />
                    <ReactionMint {...reactionCommonProps} />
                    {/* TODO */}
                    {/* <ReactionTip {...reactionCommonProps} /> */}
                  </>
                )
              }
            </XStack>
          </XStack>
        </XStack>
      </Stack>

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
  headerContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    width: width * 0.7,
    height: width * 0.7,
  },
});
