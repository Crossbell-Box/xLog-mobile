import type { FC } from "react";
import { useMemo, useState } from "react";
import Animated, { FadeInLeft, FadeOutLeft, interpolate, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";

import { ChevronDown } from "@tamagui/lucide-icons";
import { Button, isWeb, Stack, Text, useCurrentColor, XStack, YStack } from "tamagui";

import { NavigationHeader } from "@/components/Header";
import { i18n } from "@/i18n";
import type { FeedType } from "@/models/home.model";

import { HotInterval } from "./HotInterval";

// TODO
export type SortType = Exclude<FeedType, "topic" | "following">;

export const sortType: Record<Uppercase<SortType>, SortType> = {
  LATEST: "latest",
  HOT: "hot",
};

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<0 | 1>
  currentSortType: SortType
  daysInterval: number
  onSortTypeChange: (type: SortType) => void
  onDaysIntervalChange: (days: number) => void
}

type Measurements = Array<Partial<{ x: number; width: number }>>;

export const Header: FC<Props> = (props) => {
  const primaryColor = useCurrentColor("orange9");
  const inactiveColor = useCurrentColor("$colorSubtitle");
  const lengthOfSortType = Object.values(sortType).length;
  const { isExpandedAnimValue, currentSortType, onSortTypeChange } = props;
  const [_measurements, setMeasurements] = useState<Measurements>([]);
  const indicatorAnimValuePos = useDerivedValue(() => withTiming(Object.values(sortType).indexOf(currentSortType)), [currentSortType]);
  const measurements = useMemo<Measurements | undefined>(() => {
    if (_measurements.filter(m => !!m).length === lengthOfSortType)
      return _measurements;

    return undefined;
  }, [_measurements]);

  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);

  const indicatorAnimStyle = useAnimatedStyle(() => {
    if ((_WORKLET || isWeb) && measurements) {
      const width = interpolate(
        indicatorAnimValuePos.value,
        [0, 1, 2],
        measurements.map(m => (m?.width ?? 0) / 2),
      );

      return {
        width,
        opacity: 1,
        left: interpolate(
          indicatorAnimValuePos.value,
          [0, 1, 2],
          measurements.map(m => m?.x ?? 0),
        ),
        transform: [
          {
            translateX: width / 2,
          },
        ],
      };
    }

    return {
      opacity: 0,
    };
  }, [currentSortType, measurements]);

  const tabs: Array<{
    type: SortType
    title: string | ((props: { tintColor: string; fontWeight: string }) => React.ReactNode)
    onPress?: () => void
  }> = [
    {
      type: sortType.LATEST,
      title: i18n.t("latest"),
    },
    {
      type: sortType.HOT,
      title: ({ tintColor, fontWeight }) => (
        <XStack alignItems="center">
          <Text
            color={tintColor}
            fontWeight={fontWeight}
          >
            {i18n.t("hot")}
          </Text>
          {currentSortType === sortType.HOT && (
            <Animated.View entering={FadeInLeft.duration(200)} exiting={FadeOutLeft.duration(200)}>
              <ChevronDown
                color={tintColor}
                fontWeight={fontWeight}
                width={16}
                height={16}
              />
            </Animated.View>
          )}
          <HotInterval
            open={isHotIntervalBottomSheetOpen}
            value={props.daysInterval.toString()}
            onOpenChange={setIsHotIntervalBottomSheetOpen}
            onValueChange={(value) => {
              setIsHotIntervalBottomSheetOpen(false);
              props.onDaysIntervalChange(Number(value));
            }}
          />
        </XStack>
      ),
      onPress: () => {
        const isHotActive = currentSortType === sortType.HOT;
        isHotActive
          ? setIsHotIntervalBottomSheetOpen(true)
          : onSortTypeChange(sortType.HOT);
      },
    },
  ];

  return (
    <>
      <NavigationHeader expanded={isExpandedAnimValue} />
      <YStack borderBottomWidth={1} borderBottomColor={"$gray4"}>
        <XStack alignItems="center">
          {
            tabs.map(({ type, title, onPress }, index) => {
              const isActive = type === currentSortType;
              const tintColor = isActive ? primaryColor : inactiveColor;
              const fontWeight = isActive ? "bold" : "normal";
              const content = typeof title === "string"
                ? (
                  <Text
                    color={tintColor}
                    fontWeight={fontWeight}
                  >
                    {title}
                  </Text>
                )
                : title({ tintColor, fontWeight });

              return (
                <Stack key={type} onLayout={({ nativeEvent: { layout: { width, x } } }) => {
                  setMeasurements((prev) => {
                    const newButtonMeasurements = [...prev];
                    newButtonMeasurements[index] = { width, x };
                    return newButtonMeasurements;
                  });
                }}>
                  <Button
                    marginTop={5}
                    height={40}
                    unstyled
                    padding={12}
                    onPress={() => {
                      onPress
                        ? onPress?.()
                        : onSortTypeChange(type);
                    }}
                  >
                    {content}
                  </Button>
                </Stack>
              );
            })
          }
        </XStack>
        <Animated.View style={[indicatorAnimStyle, { borderBottomWidth: 2, borderColor: primaryColor }]} />
      </YStack>
    </>
  );
};
