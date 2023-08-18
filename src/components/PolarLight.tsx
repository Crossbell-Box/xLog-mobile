import { useEffect, type FC, useCallback } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Dimensions, StyleSheet } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { Easing, Extrapolate, cancelAnimation, interpolate, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import { Blur, Canvas, Group, LinearGradient, Rect, Shadow, Turbulence, Vertices, vec } from "@shopify/react-native-skia";

import { useAnimatedGradientColor } from "@/hooks/use-animated-gradient-color";
import { useAnimatedGradientColors } from "@/hooks/use-animated-gradient-colors";

const { width } = Dimensions.get("window");

export const polarLightWidth = width;
export const polarLightHeight = polarLightWidth / 1.58;

const posCount = 12;
const posGap = polarLightWidth / (posCount - 2);
const posArr = Array.from({ length: posCount }).map((_, i) => [i * posGap, 0]);
const lineWidth = 20;

export const PolarLightPalettes = {
  "green-dark": {
    g1: "#0F6852",
    g2: "#397380",
    g3: "#193355",
  },
  "purple-light": {
    g1: "#9f75b3",
    g2: "#b2c6e9",
    g3: "#6bbbdf",
  },
  "red": {
    g1: "#bf4240",
    g2: "#f9e2d3",
    g3: "#ff6e47",
  },
  "purple-dark": {
    g1: "#8049fc",
    g2: "#6babd2",
    g3: "#9bf571",
  },
  "green-light": {
    g1: "#23a111",
    g2: "#bdee38",
    g3: "#010401",
  },
  "blue-light": {
    g1: "#009afb",
    g2: "#f9e2d3",
    g3: "#fc6b0f",
  },
};

const AnimatedLine: FC<{
  index: number
  x: number
  y: number
  reverse?: boolean
  animVal: SharedValue<number>
  linesGradientColors: ReturnType<typeof useAnimatedGradientColors>
}> = ({ index, x, y, animVal, reverse, linesGradientColors }) => {
  const animatedGap = 50 / posCount;
  const startInput = animatedGap * index;
  const endInput = animatedGap * (index + 1);

  const animatedX = useDerivedValue(() => {
    return interpolate(
      animVal.value,
      [-100, -80, -50, -20, 0],
      [x + 50, x + 50, x, x + 50, x + 50],
    );
  }, [x, animVal]);

  const animatedOpacity = useDerivedValue(() => {
    const animatedGap = 50 / posCount * 2;
    const startInput = animatedGap * index;
    const endInput = animatedGap * (index + 1);
    return interpolate(
      animVal.value,
      [-endInput, -startInput, -startInput, -endInput],
      [0.2, 0.5, 0.5, 0.2],
      Extrapolate.CLAMP,
    );
  }, [x, animVal]);

  const animatedWidth = useDerivedValue(() => {
    const width = lineWidth + (posCount - index) - index * 1;

    return interpolate(
      animVal.value,
      [-endInput, -startInput, -startInput, -endInput],
      [width * 0.9, width, width, width * 0.9],
      Extrapolate.CLAMP,
    );
  }, [x, animVal, index]);

  return (
    <Rect
      {
        ...reversePosProps(
          animatedX.value,
          y - (polarLightWidth / 2),
          animatedWidth.value,
          polarLightWidth * 2,
          reverse,
        )
      }
      opacity={animatedOpacity}
      transform={[{
        rotate: reverse
          ? -Math.PI / 12 - 1.2 * index / 40
          : Math.PI / 12 + 1.2 * index / 40,
      }]}
    >
      <LinearGradient
        start={
          reverse
            ? vec(0, 0)
            : vec(0, polarLightWidth)
        }
        end={
          reverse
            ? vec(polarLightWidth, polarLightWidth)
            : vec(polarLightWidth, 0)
        }
        positions={[0, 0.5, 0.65, 0.7, 0.9, 1]}
        colors={linesGradientColors.colors}
      />
    </Rect>
  );
};

const AnimatedMask: FC<{
  animVal: SharedValue<number>
}> = ({ animVal }) => {
  const animatedBlur = useDerivedValue(() => {
    return interpolate(
      animVal.value,
      [-100, -50, 0],
      [5, 3, 5],
      Extrapolate.CLAMP,
    );
  }, []);

  return (
    <Blur blur={animatedBlur} mode={"decal"}/>
  );
};

export const PolarLight: FC<{
  reverse?: boolean
  palettes?: (typeof PolarLightPalettes)[keyof typeof PolarLightPalettes][]
  indexAnimVal?: SharedValue<number>
  style?: StyleProp<ViewStyle>
  enableAnimation?: boolean
}> = ({ style, reverse, indexAnimVal, enableAnimation = false, palettes = [PolarLightPalettes["green-dark"]] }) => {
  const animVal = useSharedValue(0);
  const navigation = useNavigation();

  const startAnim = () => {
    animVal.value = withRepeat(
      withTiming(
        animVal.value > -50 ? -100 : 0,
        { duration: 3 * 1000, easing: Easing.linear },
      ),
      0,
      true,
    );
  };

  useEffect(() => {
    if (!enableAnimation) {
      return;
    }

    let timer;

    // @ts-expect-error
    const onGestureStartDisposer = navigation.addListener("gestureStart", () => {
      cancelAnimation(animVal);
    });

    // @ts-expect-error
    const onGestureEndDisposer = navigation.addListener("gestureEnd", (e) => {
      startAnim();
    });

    const onStateDisposer = navigation.addListener("focus", (e) => {
      timer = setTimeout(() => {
        startAnim();
      }, 1000);
    });

    return () => {
      onGestureStartDisposer();
      onGestureEndDisposer();
      onStateDisposer();
      timer && clearTimeout(timer);
      cancelAnimation(animVal);
    };
  }, [enableAnimation]);

  const vertices = {
    colors: ["#000000b2", "#000", "#000000b2"],
    vertices: [vec(polarLightWidth * 1.1, polarLightHeight * 0.15), vec(polarLightWidth * 1.1, polarLightHeight * 1.1), vec(-polarLightWidth * 0.1, polarLightHeight * 1.1)],
    verticesReversed: [vec(polarLightWidth * -0.1, polarLightHeight * 0.15), vec(polarLightWidth * -0.1, polarLightHeight * 1.1), vec(polarLightWidth * 1.1, polarLightHeight * 1.1)],
  };

  const bgGradientColors = useAnimatedGradientColors(
    palettes.map(palette => [palette.g3, palette.g3, palette.g2, palette.g1]),
    {
      progressAnimVal: indexAnimVal,
    },
  );

  const dotsGradientColor = useAnimatedGradientColor(
    palettes.map(palette => palette.g1),
    {
      progressAnimVal: indexAnimVal,
    },
  );

  const linesGradientColors = useAnimatedGradientColors(
    palettes.map(palette => ["#000", palette.g1, palette.g1, palette.g2, palette.g3, palette.g3]),
    {
      progressAnimVal: indexAnimVal,
    },
  );

  return (
    <Canvas style={[styles.canvasContainer, style]}>
      <Group>
        <Rect x={0} y={0} width={polarLightWidth} height={polarLightWidth}>
          <LinearGradient
            start={
              reverse
                ? vec(0, 0)
                : vec(polarLightWidth, 0)
            }
            end={
              reverse
                ? vec(polarLightWidth, polarLightWidth)
                : vec(0, polarLightWidth)
            }
            positions={[0, 0.4, 0.5, 0.9, 1]}
            colors={bgGradientColors.colors}
          />
        </Rect>
        {
          posArr.map(([x, y], i) => (
            <AnimatedLine
              key={i}
              linesGradientColors={linesGradientColors}
              reverse={reverse}
              x={x}
              index={i}
              animVal={animVal}
              y={y - (polarLightWidth / 2)}
            />
          ))
        }

        <Vertices
          vertices={
            reverse
              ? vertices.verticesReversed
              : vertices.vertices
          }
          colors={
            reverse
              ? vertices.colors.reverse()
              : vertices.colors
          }
        >
          <Shadow dx={-20} dy={-20} blur={30} color="#000" />
          <Blur blur={10} />
        </Vertices>

        <Rect
          x={reverse ? polarLightWidth : 0}
          y={polarLightHeight * 0.6}
          width={polarLightWidth * 0.25}
          height={polarLightHeight * 0.4}
          transform={[{ rotate: Math.PI / 12 }]}
          color={dotsGradientColor.color}
        >
          <Shadow dx={-10} dy={-10} blur={20} color="#0000007d" />
          <Blur blur={20} />
        </Rect>

        <AnimatedMask animVal={animVal}/>

      </Group>

      <Rect
        {
          ...reversePosProps(
            0,
            0,
            polarLightWidth,
            polarLightHeight,
            reverse,
          )
        }
      >
        <Turbulence
          freqX={2.3}
          freqY={2.3}
          octaves={1}
        />
      </Rect>

      <Rect
        {
          ...reversePosProps(
            -20,
            polarLightHeight - 20,
            polarLightWidth,
            20,
            reverse,
          )
        }
        color={"black"}
      >
        <Blur blur={20} />
      </Rect>
    </Canvas>
  );
};

const reversePosProps = (
  x: number,
  y: number,
  width: number,
  height: number,
  reverse: boolean,
) => {
  if (reverse) {
    return {
      x: x + width,
      y: y + height,
      width: -width,
      height: -height,
    };
  }
  return {
    x,
    y,
    width,
    height,
  };
};

const styles = StyleSheet.create({
  canvasContainer: {
    width: polarLightWidth,
    height: polarLightHeight,
  },
});
