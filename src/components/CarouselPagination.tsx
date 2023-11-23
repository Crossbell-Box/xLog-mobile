import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import { Stack, Theme, XStack } from "tamagui";

import { useColors } from "@/hooks/use-colors";
import { useThemeStore } from "@/hooks/use-theme-store";

export const CarouselPagination: React.FC<{
  count: number
  progressValue: Animated.SharedValue<number>
  dotSize?: number
}> = ({ count, progressValue, dotSize }) => {
  return (
    <XStack gap="$1">
      {Array.from({ length: count }).map((_, index) => {
        return (
          <PaginationItem
            animValue={progressValue}
            index={index}
            key={index}
            count={count}
            dotSize={dotSize}
          />
        );
      })}
    </XStack>
  );
};

const PaginationItem: React.FC<{
  index: number
  count: number
  dotSize?: number
  animValue: Animated.SharedValue<number>
}> = (props) => {
  const { animValue, index, count, dotSize = 10 } = props;
  const { primary } = useColors();
  const { isDarkMode } = useThemeStore();
  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-dotSize, 0, dotSize];

    if (index === 0 && animValue?.value > count - 1) {
      inputRange = [count - 1, count, count + 1];
      outputRange = [-dotSize, 0, dotSize];
    }

    return {
      transform: [
        {
          translateX: interpolate(
            animValue?.value,
            inputRange,
            outputRange,
            Extrapolate.CLAMP,
          ),
        },
      ],
    };
  }, [animValue, index, count]);

  return (
    <Stack
      backgroundColor={isDarkMode ? "#ffffff7d" : "#0000007d"}
      width={dotSize}
      height={dotSize}
      borderRadius={50}
      overflow="hidden"
    >
      <Animated.View
        style={[
          {
            borderRadius: 50,
            backgroundColor: primary,
            flex: 1,
          },
          animStyle,
        ]}
      />
    </Stack>
  );
};
