import type { FC } from "react";
import { Dimensions } from "react-native";

import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import { Stack } from "tamagui";

export const width = Dimensions.get("window").width;
export const height = width / 1.58;

const bgs = [
  require("../assets/home-grid-bg/0.png"),
  require("../assets/home-grid-bg/1.png"),
  require("../assets/home-grid-bg/2.png"),
];

export const PolarLightBackground: FC<{
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

      <Stack position="absolute" width={width} height={height} top={0}>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={width} height={height}>
            <LinearGradient
              start={vec(width / 2, height)}
              end={vec(width / 2, 0)}
              positions={[0, 0.2, 1]}
              colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.1)", "rgba(0,0,0,0)"]}
            />
          </Rect>
        </Canvas>
      </Stack>
    </Stack>
  );
};
