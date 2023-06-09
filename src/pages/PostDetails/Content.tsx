import React, { useImperativeHandle, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, withSpring, withDelay, measure, runOnUI } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { useCharacter, useNote } from "@crossbell/indexer";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useToastController } from "@tamagui/toast";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { H2, Spacer, Stack, useWindowDimensions, YStack } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { WebView } from "@/components/WebView";
import { VERSION } from "@/constants";
import { IPFS_GATEWAY } from "@/constants/env";
import { PageNotFound } from "@/constants/resource";
import useGAWithPageStayTime from "@/hooks/ga/use-ga-with-page-stay-time";
import { useCharacterId } from "@/hooks/use-character-id";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useOneTimeToggler } from "@/hooks/use-one-time-toggle";
import { usePostWebViewLink } from "@/hooks/use-post-link";
import type { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";
import { useGetPage } from "@/queries/page";
import { callChain } from "@/utils/call-chain";
import { GA } from "@/utils/GA";
import { getNoteSlug } from "@/utils/get-slug";

import { javaScriptBeforeContentLoaded } from "./javascript-content";
import { Skeleton } from "./Skeleton";

export interface Props {
  noteId: number
  characterId: number
  navigation: NativeStackNavigationProp<RootStackParamList, "PostDetails", undefined>
  scrollEventHandler: ReturnType<typeof useScrollVisibilityHandler>
  headerContainerHeight: number
  bottomBarHeight: number
  postUri: string
  renderHeaderComponent?: (isCapturing: boolean) => React.ReactNode
}

export interface PostDetailsContentInstance {
  takeScreenshot: () => Promise<string>
}

const { width } = Dimensions.get("window");

export const Content = React.forwardRef<PostDetailsContentInstance, Props>((props, ref) => {
  const { noteId, postUri, renderHeaderComponent, characterId, navigation, scrollEventHandler, bottomBarHeight, headerContainerHeight } = props;
  const { isDarkMode, mode } = useThemeStore();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const myCharacterId = useCharacterId();
  const [siteT] = useTranslation("site");
  const [commonT] = useTranslation("common");
  const screenshotsRef = useRef<Animated.ScrollView>(null);
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);

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

  const i18n = useTranslation("common");
  const { top, bottom } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const headerHeight = top + headerContainerHeight;
  const contentLoaderDimensions = { width, height: height - headerHeight };
  const webviewLoadingAnimValue = useSharedValue<number>(0);
  const followAnimValue = useSharedValue<number>(0);
  const [webviewHeight, setWebviewHeight] = React.useState(contentLoaderDimensions.height);
  const { ...scrollVisibilityHandler } = scrollEventHandler;
  const [userAgent, setUserAgent] = React.useState<string>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const globalLoading = useGlobalLoading();
  const toast = useToastController();
  const gaReadEventLogged = useRef(false);
  const noteTitle = note.data?.metadata?.content?.title;

  useGAWithPageStayTime({
    page_name: "post_details",
    params: {
      character_id: myCharacterId,
      note_id: noteId,
      note_title: noteTitle,
    },
  });

  const onWebViewMessage = (event) => {
    try {
      const { data } = event.nativeEvent;
      const { height, imageUrlArray, link } = JSON.parse(data);

      if (link) {
        navigation.navigate("Web", { url: link });
      }

      if (height) {
        setWebviewHeight(Math.max(height, contentLoaderDimensions.height));
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

  const onSaveImageAsync = async () => {
    try {
      globalLoading.show();

      const mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
      if (!mediaLibraryPermissions.granted) {
        toast.show(commonT("Permission denied"), {
          burntOptions: {
            preset: "none",
            haptic: "warning",
          },
        });
        return;
      }

      setIsCapturing(true);

      await new Promise(resolve => setTimeout(resolve, 250));

      const localUri = await captureRef(screenshotsRef, {
        width,
        quality: 1,
        snapshotContentContainer: true,
        // @ts-expect-error
        useRenderInContext: true,
      });

      setIsCapturing(false);

      return localUri;
    }
    catch (error) {
      console.error(error);
      toast.show(i18n.t("Failed to save image"), {
        burntOptions: {
          preset: "error",
          haptic: "error",
        },
      });
    }
    finally {
      globalLoading.hide();
    }
  };

  useImperativeHandle(ref, () => ({
    takeScreenshot: onSaveImageAsync,
  }));

  useEffect(() => {
    followAnimValue.value = withDelay(1500, withSpring(1));
  }, []);

  useEffect(() => {
    DeviceInfo.getUserAgent().then((us) => {
      setUserAgent(`${us} ReactNative/${VERSION}`);
    });
  }, []);

  const backgroundColor = isDarkMode ? "#000" : "#fff";

  return (
    <>
      {pageIsNotFound
        ? (
          <YStack paddingTop={headerHeight + 50} paddingHorizontal="$2" alignItems="center">
            <H2>{siteT("404 - Whoops, this page is gone.")}</H2>
            <Spacer size={100} />
            <Image source={PageNotFound} contentFit={"contain"} style={styles.notFound} />
          </YStack>
        )
        : (
          <Animated.ScrollView
            ref={screenshotsRef}
            bounces={false}
            {...scrollVisibilityHandler}
            onMomentumScrollEnd={
              callChain([
                scrollVisibilityHandler.onMomentumScrollEnd,
                (e) => {
                  if (gaReadEventLogged.current) {
                    return;
                  }
                  const offsetY = e.nativeEvent.contentOffset.y + e.nativeEvent.layoutMeasurement.height;
                  const height = e.nativeEvent.contentSize.height;
                  // 是否到达底部
                  if (offsetY / height >= 0.9) {
                    GA.logEvent("post_details_read_completely", {
                      character_id: myCharacterId,
                      note_id: noteId,
                      note_title: noteTitle,
                    }).then(() => {
                      gaReadEventLogged.current = true;
                    });
                  }
                },
              ])
            }
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: bottomBarHeight }}
            scrollEventThrottle={16}
            scrollIndicatorInsets={{
              top: headerHeight - top,
              bottom: bottomBarHeight - bottom,
            }}
          >
            {renderHeaderComponent?.(isCapturing)}
            <Animated.ScrollView
              style={[
                styles.webviewContainer,
                { height: webviewHeight },
              ]}
              contentContainerStyle={{ height: webviewHeight }}
              scrollEventThrottle={16}
            >
              {postUri && userAgent && (
                <WebView
                  javaScriptEnabled
                  userAgent={userAgent}
                  source={{ uri: postUri }}
                  style={[styles.webview, { backgroundColor }]}
                  containerStyle={styles.webview}
                  scrollEnabled={false}
                  cacheEnabled
                  renderLoading={() => (
                    <Stack position="absolute" flex={1} backgroundColor={backgroundColor} {...StyleSheet.absoluteFillObject}>
                      <Skeleton webviewLoadingAnimValue={webviewLoadingAnimValue} headerHeight={0} />
                    </Stack>
                  )}
                  startInLoadingState={true}
                  cacheMode="LOAD_CACHE_ELSE_NETWORK"
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  onMessage={onWebViewMessage}
                  injectedJavaScript={javaScriptBeforeContentLoaded(
                    isDarkMode,
                    mode,
                    bottomBarHeight,
                    height,
                  )}
                />
              )}
            </Animated.ScrollView>
          </Animated.ScrollView>
        )}

      <ImageGallery
        isVisible={displayImageUris.length > 0}
        uris={displayImageUris}
        onClose={closeModal}
      />
    </>
  );
});

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
