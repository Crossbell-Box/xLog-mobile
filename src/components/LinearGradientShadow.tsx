import { useEffect } from "react";
import { Dimensions } from "react-native";

import { Canvas, Shadow, RoundedRect, useValue, useComputedValue, interpolateColors, runTiming } from "@shopify/react-native-skia";
import a from "color-alpha";
import { Stack } from "tamagui";

import { PolarLightPalettes } from "@/components/PolarLight";

const { width } = Dimensions.get("window");

export const LinearGradientShadow = () => {
  const height = 300;

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

  return (
    <Stack width={width} height={height} flex={1} justifyContent="center" backgroundColor={"#1d1d1d"}>
      <Canvas style={{ width, height }}>
        {
          animatedColors.map((c, i) => (
            <RoundedRect key={i} r={20} x={x + (boxWidth / 3) * i} y={y} width={boxWidth / 3} height={boxHeight} color={c}>
              <Shadow dx={0} dy={0} blur={40} color={c} />
            </RoundedRect>
          ))
        }
        <RoundedRect r={20} x={x} y={y} width={boxWidth} height={boxHeight} color={"#f1f1f1"}/>
      </Canvas>
    </Stack>
  );
};
