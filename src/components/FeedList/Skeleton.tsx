import type { FC } from "react";
import React from "react";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { useWindowDimensions, YStack } from "tamagui";

export const Skeleton: FC<{
  itemWidth: number
}> = ({
  itemWidth,
}) => {
  const { width, height } = useWindowDimensions();
  const contentLoaderDimensions = { width, height };

  const paddingSize = 8;

  const renderItem = (
    isLeft: boolean,
    offset = 0,
  ) => {
    const x = isLeft ? 0 : width - itemWidth - paddingSize - paddingSize;
    const y = offset * (235 + paddingSize);
    return (
      <>
        <Rect x={x} y={y + 20} rx={3} ry={3} width={itemWidth} height={150} />
        <Rect x={x} y={y + 20 + 150 + 10} rx={3} ry={3} width={itemWidth} height={20} />
        <Circle cx={x + 20} cy={y + 50 + 150 + 30} r={20} />
        <Rect x={x + 50} y={y + 50 + 150 + 20} rx={3} ry={3} width={itemWidth - 50} height={20} /></>
    );
  };

  return (
    <Animated.View
      style={{
        height,
        width: "100%",
      }}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(1000)}
    >
      <YStack height={contentLoaderDimensions.height} alignItems={"flex-start"} justifyContent={"flex-start"}>
        <ContentLoader
          viewBox={`0 0 ${contentLoaderDimensions.width - paddingSize * 2} ${contentLoaderDimensions.height}`}
          backgroundColor={"gray"}
          opacity="0.3"
        >
          {renderItem(true)}
          {renderItem(false)}
          {renderItem(true, 1)}
          {renderItem(false, 1)}
          {renderItem(true, 2)}
        </ContentLoader>
      </YStack>
    </Animated.View>
  );
};
