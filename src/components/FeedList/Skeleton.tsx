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
    offset,
    totalHeight,
  ) => {
    const contentHeight = totalHeight - 85;
    const x = isLeft ? 0 : width - itemWidth - paddingSize - paddingSize;
    const y = offset;
    return (
      <>
        <Rect x={x} y={y + 20} rx={3} ry={3} width={itemWidth} height={contentHeight} />
        <Rect x={x} y={y + contentHeight + 30} rx={3} ry={3} width={itemWidth} height={20} />
        <Circle cx={x + 20} cy={y + 50 + contentHeight + 30} r={20} />
        <Rect x={x + 50} y={y + 50 + contentHeight + 20} rx={3} ry={3} width={itemWidth - 50} height={20} />
      </>
    );
  };

  const renderList = (
    // item height
    list: [number, number][],
  ) => {
    const gap = 10;
    return list.map((items, index) => {
      const [left, right] = items;
      const [leftPrevItemsHeight, rightPrevItemsHeight] = list.slice(0, index).reduce((acc, items) => {
        const [left, right] = items;
        const [leftPrevItemsHeight, rightPrevItemsHeight] = acc;
        return [
          leftPrevItemsHeight + left + gap,
          rightPrevItemsHeight + right + gap,
        ];
      }, [0, 0]);

      return (
        <React.Fragment key={index}>
          {renderItem(true, leftPrevItemsHeight + gap, left)}
          {renderItem(false, rightPrevItemsHeight + gap, right)}
        </React.Fragment>
      );
    });
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
          viewBox={`0 30 ${contentLoaderDimensions.width - paddingSize * 2} ${contentLoaderDimensions.height}`}
          backgroundColor={"gray"}
          opacity="0.3"
        >
          {
            renderList([
              [285, 235],
              [255, 235],
              [285, 235],
            ])
          }
        </ContentLoader>
      </YStack>
    </Animated.View>
  );
};
