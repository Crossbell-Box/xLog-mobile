import type { FC } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Animated, { FadeInLeft, FadeOutLeft, interpolate, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";

import { useConnectedAccount } from "@crossbell/react-account";
import { ChevronDown } from "@tamagui/lucide-icons";
import { Button, isWeb, Stack, Text, XStack, YStack } from "tamagui";

import { NavigationHeader } from "@/components/Header";
import { isAndroid } from "@/constants/platform";
import { useColors } from "@/hooks/use-colors";
import type { FeedType as AllFeedType } from "@/models/home.model";
import { GA } from "@/utils/GA";

import { HotInterval } from "./HotInterval";

export type FeedType = Extract<AllFeedType, "latest" | "hottest" | "following">;

export const feedType: Record<Uppercase<FeedType>, FeedType> = {
  LATEST: "latest",
  HOTTEST: "hottest",
  FOLLOWING: "following",
};

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<0 | 1>
  currentFeedType: FeedType
  daysInterval: number
  onFeedTypeChange: (type: FeedType) => void
  onDaysIntervalChange: (days: number) => void
  isSearching?: boolean
}

type Measurements = Array<Partial<{ x: number; width: number }>>;

export const Header: FC<Props> = (props) => {
  const { daysInterval, isSearching, onDaysIntervalChange } = props;
  const { primary: primaryColor, subtitle: inactiveColor } = useColors();
  const i18n = useTranslation("dashboard");
  const { isExpandedAnimValue, currentFeedType, onFeedTypeChange } = props;
  const [_measurements, setMeasurements] = useState<Measurements>([]);
  const connectedAccount = useConnectedAccount();
  const indicatorAnimValuePos = useDerivedValue(() => withTiming(Object.values(feedType).indexOf(currentFeedType)), [currentFeedType]);
  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);

  const tabs: Array<{
    type: FeedType
    title: string | ((props: { tintColor: string; fontWeight: string }) => React.ReactNode)
    onPress?: () => void
  }> = useMemo(() => {
    const tabs = [
      {
        type: feedType.LATEST,
        title: ({ tintColor, fontWeight }) => (
          <Text
            color={tintColor}
            fontWeight={fontWeight}
            fontSize={"$5"}
          >
            {i18n.t("Latest")}
          </Text>
        ),
      },
      {
        type: feedType.HOTTEST,
        title: ({ tintColor, fontWeight }) => (
          <XStack alignItems="center" gap="$1">
            <Stack height={18}>
              <Text
                color={tintColor}
                fontWeight={fontWeight}
                fontSize={"$5"}
              >
                {i18n.t("Hottest")}
              </Text>
            </Stack>
            {currentFeedType === feedType.HOTTEST && (
              <Animated.View entering={FadeInLeft.duration(200)} exiting={FadeOutLeft.duration(200)}>
                <Stack paddingTop={isAndroid ? "$1" : undefined}>
                  <ChevronDown
                    color={tintColor}
                    fontWeight={fontWeight}
                    width={12}
                    height={12}
                  />
                </Stack>
              </Animated.View>
            )}
            <HotInterval
              open={isHotIntervalBottomSheetOpen}
              value={daysInterval.toString()}
              onOpenChange={setIsHotIntervalBottomSheetOpen}
              onValueChange={(value) => {
                setIsHotIntervalBottomSheetOpen(false);
                onDaysIntervalChange(Number(value));
              }}
            />
          </XStack>
        ),
        onPress: () => {
          const isHotActive = currentFeedType === feedType.HOTTEST;
          isHotActive
            ? setIsHotIntervalBottomSheetOpen(true)
            : onFeedTypeChange(feedType.HOTTEST);
        },
      },
    ];

    if (connectedAccount && !isSearching) {
      tabs.push({
        type: feedType.FOLLOWING,
        title: ({ tintColor, fontWeight }) => (
          <Text
            color={tintColor}
            fontWeight={fontWeight}
            fontSize={"$5"}
          >
            {i18n.t("Following")}
          </Text>
        ),
      });
    }

    return tabs;
  }, [
    connectedAccount,
    currentFeedType,
    i18n,
    isHotIntervalBottomSheetOpen,
    daysInterval,
    isSearching,
    onFeedTypeChange,
    onDaysIntervalChange,
  ]);

  const measurements = useMemo<Measurements | undefined>(() => {
    if (_measurements.filter(m => !!m).length === tabs.length)
      return _measurements;

    return undefined;
  }, [_measurements, tabs]);

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
  }, [currentFeedType, measurements]);

  return (
    <>
      <NavigationHeader expanded={isExpandedAnimValue} />
      <YStack borderBottomWidth={1} borderBottomColor={"$gray4"}>
        <XStack alignItems="center">
          {
            tabs.map(({ type, title, onPress }, index) => {
              const isActive = type === currentFeedType;
              const tintColor = isActive ? primaryColor : inactiveColor;
              const fontWeight = isActive ? "bold" : "normal";
              const content = typeof title === "string"
                ? (
                  <Text
                    color={tintColor}
                    fontWeight={"$16"}
                  >
                    {title}
                  </Text>
                )
                : title({ tintColor, fontWeight });

              return (
                <Stack
                  key={type}
                  onLayout={({ nativeEvent: { layout: { width, x } } }) => {
                    setMeasurements((prev) => {
                      const newButtonMeasurements = [...prev];
                      newButtonMeasurements[index] = { width, x };
                      return newButtonMeasurements;
                    });
                  }}
                >
                  <Button
                    marginTop={5}
                    height={40}
                    unstyled
                    padding={12}
                    onPress={() => {
                      GA.logEvent("feed_type_changed", { feed_type: type });

                      onPress
                        ? onPress?.()
                        : onFeedTypeChange(type);
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
