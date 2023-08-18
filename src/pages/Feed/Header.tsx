import type { FC } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type Animated from "react-native-reanimated";
import { useSharedValue, withTiming } from "react-native-reanimated";

import { useConnectedAccount } from "@crossbell/react-account";
import { runTiming } from "@shopify/react-native-skia";
import { Button, Stack, XStack, YStack } from "tamagui";

import { NavigationHeader } from "@/components/Header";
import { PolarLight, PolarLightPalettes } from "@/components/PolarLight";
import { useColors } from "@/hooks/use-colors";
import { GA } from "@/utils/GA";

import { feedTypes, type FeedType } from "./feedTypes";
import { AnimatedTab } from "./Tabs";

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<number>
  currentFeedType: FeedType
  daysInterval: number
  onFeedTypeChange: (type: FeedType) => void
  onDaysIntervalChange: (days: number) => void
  isSearching?: boolean
}

type Measurements = Array<Partial<{ x: number; width: number }>>;

export const HeaderTabHeight = 60;

export const Header: FC<Props> = (props) => {
  const { daysInterval, isSearching, onDaysIntervalChange } = props;
  const { primary: primaryColor, subtitle: inactiveColor } = useColors();
  const i18n = useTranslation("dashboard");
  const { isExpandedAnimValue, currentFeedType, onFeedTypeChange } = props;
  const [_measurements, setMeasurements] = useState<Measurements>([]);
  const connectedAccount = useConnectedAccount();
  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);
  const tabsAnimVal = Array.from({ length: 3 }).map((_, i) => useSharedValue<number>(i === 0 ? 1 : 0));
  const animVal = useSharedValue<number>(0);

  return (
    <Stack>
      <PolarLight
        reverse
        indexAnimVal={animVal}
        palettes={[
          PolarLightPalettes["green-dark"],
          PolarLightPalettes["purple-light"],
          PolarLightPalettes.red,
        ]}
        style={{
          position: "absolute",
        }}
      />
      <NavigationHeader expanded={isExpandedAnimValue}>
        <XStack marginHorizontal="$3" gap="$4" height={HeaderTabHeight}>
          {
            Object.values(feedTypes).map((type, index) => {
              if (type === feedTypes.FOLLOWING && (!connectedAccount || isSearching)) {
                return null;
              }

              const content = {
                [feedTypes.LATEST]: <AnimatedTab
                  animVal={tabsAnimVal[index]}
                  label={i18n.t("Latest")}
                  index={index}
                />,
                [feedTypes.HOTTEST]: (
                  <AnimatedTab
                    animVal={tabsAnimVal[index]}
                    label={i18n.t("Hottest")}
                    index={index}
                  />
                ),
                [feedTypes.FOLLOWING]: <AnimatedTab
                  animVal={tabsAnimVal[index]}
                  label={i18n.t("Following")}
                  index={index}
                />,
              }[type];

              return (
                <Button
                  key={type}
                  unstyled
                  height={50}
                  justifyContent="flex-end"
                  onPress={() => {
                    GA.logEvent("feed_type_changed", { feed_type: type });
                    onFeedTypeChange(type);
                    tabsAnimVal.forEach((animVal, i) => {
                      animVal.value = withTiming(i === index ? 1 : 0, { duration: 200 });
                    });
                    animVal.value = withTiming(index, { duration: 200 });

                    if (type === feedTypes.FOLLOWING) {
                      const isHotActive = currentFeedType === feedTypes.HOTTEST;
                      isHotActive
                        ? setIsHotIntervalBottomSheetOpen(true)
                        : onFeedTypeChange(feedTypes.HOTTEST);
                    }
                  }}
                >
                  {content}
                </Button>
              );
            })
          }
        </XStack>
      </NavigationHeader>
    </Stack>
  );
};
