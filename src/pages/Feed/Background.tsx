import type { FC } from "react";
import { Dimensions } from "react-native";

import { Image } from "expo-image";
import { Stack } from "tamagui";

export const width = Dimensions.get("window").width;
export const height = width / 1.58;

const bgs = [
  require("../../assets/home-grid-bg/0.png"),
  require("../../assets/home-grid-bg/1.png"),
  require("../../assets/home-grid-bg/2.png"),
];

export const Background: FC<{
  activeIndex: number
}> = ({ activeIndex }) => {
  return (
    <Stack position="absolute" width={width} height={height}>
      <Image
        source={bgs[activeIndex]}
        contentFit="contain"
        cachePolicy="memory"
        style={{ width, height }}
      />
    </Stack>
  );
};
