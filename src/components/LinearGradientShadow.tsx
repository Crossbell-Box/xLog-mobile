import type { FC, PropsWithChildren } from "react";
import { useEffect } from "react";
import { StyleProp } from "react-native";
import { Shadow as RNShadow } from "react-native-shadow-2";

import { Canvas, Shadow, RoundedRect, useValue, useComputedValue, interpolateColors, runTiming } from "@shopify/react-native-skia";
import a from "color-alpha";
import type { StackProps } from "tamagui";
import { Stack } from "tamagui";

import { PolarLightPalettes } from "@/components/PolarLight";

export const LinearGradientShadow: FC<PropsWithChildren<{
  width: number
  height: number
  blur?: number
  contentContainerStyle?: StackProps["style"]
}>> = ({
  width,
  height,
  blur = 20,
  contentContainerStyle,
  children,
}) => {
  const boxWidth = width / 1.1;
  const boxHeight = height / 2;
  const x = (width / 2) - (boxWidth / 2);
  const y = (height / 2) - (boxHeight / 2);

  const progressAnimVal = useValue(1); // 0~2
  const colors = Object.values(PolarLightPalettes["purple-light"]).map(c => a(c, 0.85));
  const animatedColors = colors.map((c, i) => {
    return useComputedValue(() => {
      const input = [
        i - 2,
        i - 1,
        i,
        i + 1,
        i + 2,
      ].map((i) => {
        if (i < 0) {
          i = i + 3;
        }
        return i % 3;
      });
      return interpolateColors(
        progressAnimVal.current,
        input,
        input.map(i => colors[i]),
      );
    }, [progressAnimVal]);
  });

  useEffect(() => {
    setInterval(() => {
      runTiming(
        progressAnimVal,
        progressAnimVal.current > 1 ? 0 : 2,
        { duration: 800 },
      );
    }, 1000);
  }, []);

  const radius = 20;

  return (
    <Stack width={width} height={height} justifyContent="center" alignItems="center">
      <Canvas style={{ width, height }}>
        {
          animatedColors.map((c, i) => (
            <RoundedRect key={i} r={radius} x={x + (boxWidth / 3) * i} y={y} width={boxWidth / 3} height={boxHeight} color={c}>
              <Shadow dx={0} dy={0} blur={blur} color={c} />
            </RoundedRect>
          ))
        }
        <RoundedRect r={radius} x={x} y={y} width={boxWidth} height={boxHeight} color={"#f1f1f1"}/>
      </Canvas>
      <Stack
        position="absolute"
        top={y}
        left={x}
        width={boxWidth}
        height={boxHeight}
        borderRadius={radius}
        backgroundColor={"transparent"}
        style={contentContainerStyle}
      >
        {children}
      </Stack>
    </Stack>
  );
};
