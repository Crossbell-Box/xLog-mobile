import type { FC } from "react";
import React from "react";
import Animated, { FadeIn, FadeOut, interpolate, useAnimatedStyle } from "react-native-reanimated";

import ContentLoader, { Rect } from "react-content-loader/native";
import { useWindowDimensions, YStack } from "tamagui";

import { useColors } from "@/hooks/use-colors";
import { useThemeStore } from "@/hooks/use-theme-store";

export const Skeleton: FC<{
  webviewLoadingAnimValue: Animated.SharedValue<number>
  headerHeight: number
}> = ({
  webviewLoadingAnimValue,
  headerHeight,
}) => {
  const { width, height } = useWindowDimensions();
  const { isDarkMode } = useThemeStore();
  const contentLoaderDimensions = { width, height: headerHeight + 200 };
  const skeletonAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(webviewLoadingAnimValue.value, [0, 1], [1, 0]),
    };
  }, []);

  return (
    <Animated.View
      style={[skeletonAnimStyles, {
        height: height - headerHeight,
        backgroundColor: isDarkMode ? "black" : "white",
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
  );
};
