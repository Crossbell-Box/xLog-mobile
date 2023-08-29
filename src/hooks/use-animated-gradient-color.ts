import type { SharedValue } from "react-native-reanimated";
import { interpolateColor, useDerivedValue, useSharedValue } from "react-native-reanimated";

export const useAnimatedGradientColor = (palette: string[], options: {
  progressAnimVal?: SharedValue<number>
}) => {
  const { progressAnimVal } = options;
  const _progress = useSharedValue(0);
  const progress = progressAnimVal ?? _progress;

  const color = useDerivedValue(() => {
    if (palette.length === 1) return palette[0];

    return interpolateColor(
      progress.value,
      Array.from({ length: palette.length }, (_, j) => j),
      palette,
    );
  }, [progress, palette]);

  return {
    progress,
    color,
  };
};
