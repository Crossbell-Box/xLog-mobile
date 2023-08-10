import { useEffect, type FC, useCallback } from "react";
import { Dimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { Easing, Extrapolate, cancelAnimation, interpolate, useDerivedValue, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import { Blur, Canvas, Group, LinearGradient, Rect, Shadow, Turbulence, Vertices, vec } from "@shopify/react-native-skia";

const { width } = Dimensions.get("window");

const posCount = 12;
const posGap = width / (posCount - 2);
const posArr = Array.from({ length: posCount }).map((_, i) => [i * posGap, 0]);
const height = width / 1.58;
const lineWidth = 20;

export const PolarLightPalettes = [
  {
    g1: "#0F6852",
    g2: "#397380",
    g3: "#193355",
  },
  {
    g1: "#9f75b3",
    g2: "#b2c6e9",
    g3: "#6bbbdf",
  },
  {
    g1: "#8049fc",
    g2: "#6babd2",
    g3: "#9bf571",
  },
  {
    g1: "#23a111",
    g2: "#bdee38",
    g3: "#010401",
  },
  {
    g1: "#009afb",
    g2: "#f9e2d3",
    g3: "#fc6b0f",
  },
  {
    g1: "#bf4240",
    g2: "#f9e2d3",
    g3: "#ff6e47",
  },
];

const AnimatedLine: FC<{
  index: number
  x: number
  y: number
  animVal: SharedValue<number>
  reverse?: boolean
  palette: (typeof PolarLightPalettes)[number]
}> = ({ index, x, y, animVal, reverse, palette }) => {
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

  const lineGradient = {
    positions: [0, 0.5, 0.65, 0.7, 0.9, 1],
    colors: ["#000", palette.g1, palette.g1, palette.g2, palette.g3, palette.g3],
  };

  return (
    <Rect
      {
        ...reversePosProps(
          animatedX.value,
          y - (width / 2),
          animatedWidth.value,
          width * 2,
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
            : vec(0, width)
        }
        end={
          reverse
            ? vec(width, width)
            : vec(width, 0)
        }
        positions={lineGradient.positions}
        colors={lineGradient.colors}
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
  palette?: (typeof PolarLightPalettes)[number]
}> = ({ reverse, palette = PolarLightPalettes[0] }) => {
  const animVal = useSharedValue(0);
  const navigation = useNavigation();

  const startAnim = useCallback(() => {
    animVal.value = withRepeat(
      withTiming(
        animVal.value > -50 ? -100 : 0,
        { duration: 10 * 1000, easing: Easing.linear },
      ), 0, true,
    );
  }, []);

  useEffect(() => {
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
  }, []);

  const bgGradient = {
    colors: [palette.g3, palette.g3, palette.g2, palette.g1],
    positions: [0, 0.4, 0.5, 0.9, 1],
  };

  const vertices = {
    colors: ["#000000b2", "#000", "#000000b2"],
    vertices: [vec(width * 1.1, height * 0.15), vec(width * 1.1, height * 1.1), vec(-width * 0.1, height * 1.1)],
    verticesReversed: [vec(width * -0.1, height * 0.15), vec(width * -0.1, height * 1.1), vec(width * 1.1, height * 1.1)],
  };

  return (
    <Canvas style={{ width, height }}>
      <Group>
        <Rect x={0} y={0} width={width} height={width}>
          <LinearGradient
            start={
              reverse
                ? vec(0, 0)
                : vec(width, 0)
            }
            end={
              reverse
                ? vec(width, width)
                : vec(0, width)
            }
            positions={bgGradient.positions}
            colors={bgGradient.colors}
          />
        </Rect>
        {
          posArr.map(([x, y], i) => (
            <AnimatedLine
              key={i}
              palette={palette}
              reverse={reverse}
              x={x}
              index={i}
              animVal={animVal}
              y={y - (width / 2)}
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
          x={reverse ? width : 0}
          y={height * 0.6}
          width={width * 0.25}
          height={height * 0.4}
          transform={[{ rotate: Math.PI / 12 }]}
          color={palette.g1}
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
            width,
            height,
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
            height - 20,
            width,
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
