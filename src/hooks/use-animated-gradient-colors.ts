import type { SharedValue } from "react-native-reanimated";
import { interpolateColor, useDerivedValue, useSharedValue } from "react-native-reanimated";

export const useAnimatedGradientColors = (palettes: string[][], options: {
  progressAnimVal?: SharedValue<number>
}) => {
  const { progressAnimVal } = options;
  const _progress = useSharedValue<number>(0);
  const progress = progressAnimVal ?? _progress;

  const colors = useDerivedValue(() => {
    if (palettes.length === 1) return palettes[0];

    if (palettes[0].length === 1) return palettes.map(palette => palette[0]);

    return new Array(palettes[0].length).fill(0).map((_, i) => (
      interpolateColor(
        progress.value,
        Array.from({ length: palettes.length }, (_, j) => j),
        Array.from({ length: palettes.length }, (_, j) => palettes[j][i]),
      )
    ));
  }, [progress, palettes]);

  return {
    progress,
    colors,
  };
};
