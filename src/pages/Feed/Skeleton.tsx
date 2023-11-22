import type { FC } from "react";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import ContentLoader, { Rect } from "react-content-loader/native";
import { useWindowDimensions, YStack } from "tamagui";

export const Skeleton: FC<{
  height: number
}> = ({
  height,
}) => {
  const { width } = useWindowDimensions();

  const top = 50;
  const itemHeight = height - 40;
  const itemWidth = width / 1.3;

  return (
    <Animated.View
      style={[{
        height,
        top,
        position: "absolute",
        width: "100%",
      }]}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(1000)}
    >
      <YStack height={height} alignItems={"flex-start"} justifyContent={"flex-start"}>
        <ContentLoader
          viewBox={`0 0 ${width} ${height}`}
          backgroundColor={"gray"}
          opacity="0.3"
        >
          <Rect x={-itemWidth * 0.4 / 1.4} y={itemHeight / 2 - itemHeight * 0.85 / 2} rx="15" ry="15" width={itemWidth * 0.4} height={itemHeight * 0.85} />
          <Rect x={width / 2 - itemWidth / 2} y={0} rx="15" ry="15" width={itemWidth} height={itemHeight} />
          <Rect x={width - itemWidth * 0.4 / 3.4} y={itemHeight / 2 - itemHeight * 0.85 / 2} rx="15" ry="15" width={itemWidth * 0.4} height={itemHeight * 0.85} />
        </ContentLoader>
      </YStack>
    </Animated.View>
  );
};
