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

const AnimatedLine: FC<{
  index: number
  x: number
  y: number
  animVal: SharedValue<number>
}> = ({ index, x, y, animVal }) => {
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
      x={animatedX}
      y={y - (width / 2)}
      width={animatedWidth}
      height={width * 2}
      opacity={animatedOpacity}
      transform={[{ rotate: Math.PI / 12 + 1.2 * index / 40 }]}
    >
      <LinearGradient
        start={vec(0, width)}
        end={vec(width, 0)}
        positions={[0, 0.5, 0.65, 0.7, 0.9, 1]}
        colors={["#000", "rgba(15,104,82,1)", "rgba(15,104,82,1)", "#39738046", "#193355", "#193355"]}
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

export const PolarLightsBg: FC<{}> = () => {
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
    // @ts-expect-error
    const onGestureStartDisposer = navigation.addListener("gestureStart", () => {
      cancelAnimation(animVal);
    });

    // @ts-expect-error
    const onGestureEndDisposer = navigation.addListener("gestureEnd", (e) => {
      startAnim();
    });

    startAnim();

    return () => {
      onGestureStartDisposer();
      onGestureEndDisposer();
      cancelAnimation(animVal);
    };
  }, []);

  return (
    <Canvas style={{ width, height }}>
      <Group>
        <Rect x={0} y={0} width={width} height={width}>
          <LinearGradient
            start={vec(width, 0)}
            end={vec(0, width)}
            positions={[0, 0.4, 0.5, 0.9, 1]}
            colors={["#193355", "#193355", "#397380", "#0F6852"]}
          />
        </Rect>
        {
          posArr.map(([x, y], i) => (
            <AnimatedLine
              key={i}
              x={x}
              index={i}
              animVal={animVal}
              y={y - (width / 2)}
            />
          ))
        }

        <Vertices
          vertices={[vec(width * 1.1, height * 0.15), vec(width * 1.1, height * 1.1), vec(-width * 0.1, height * 1.1)]}
          colors={["#000000b2", "#000", "#000000b2"]}
        >
          <Shadow dx={-20} dy={-20} blur={30} color="#000" />
          <Blur blur={10} />
        </Vertices>

        <Rect
          x={0}
          y={height * 0.6}
          width={width * 0.25}
          height={height * 0.4}
          transform={[{ rotate: Math.PI / 12 }]}
          color={"rgba(15,104,82,1)"}
        >
          <Shadow dx={-10} dy={-10} blur={20} color="#0000007d" />
          <Blur blur={20} />
        </Rect>

        <AnimatedMask animVal={animVal}/>

      </Group>

      <Rect x={0} y={0} width={width} height={width}>
        <Turbulence
          freqX={2.3}
          freqY={2.3}
          octaves={1}
        />
      </Rect>

      <Rect
        x={-20}
        y={height - 20}
        width={width}
        height={20}
        color={"black"}
      >
        <Blur blur={20} />
      </Rect>
    </Canvas>
  );
};
