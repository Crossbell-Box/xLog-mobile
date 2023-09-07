import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";

import { useConnectedAccount } from "@crossbell/react-account";
import { Stack, Text, XStack } from "tamagui";

import { PolarLightBackground } from "@/components/PolarLightBackground";
import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { useThemeStore } from "@/hooks/use-theme-store";
import { HeaderAnimatedLayout } from "@/pages/Feed/HeaderAnimatedLayout";
import { GA } from "@/utils/GA";

import { feedTypes, type FeedType } from "./feedTypes";
import { HotInterval } from "./HotInterval";

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<number>
  daysInterval: number
  type?: FeedType
  onFeedTypeChange: (type: FeedType) => void
  onDaysIntervalChange: (days: number) => void
  isSearching?: boolean
}

export const HeaderTabHeight = 60;

export const Header: FC<Props> = (props) => {
  const { daysInterval, isSearching, type, onDaysIntervalChange } = props;
  const i18n = useTranslation("dashboard");
  const { isDarkMode } = useThemeStore();
  const { isExpandedAnimValue, onFeedTypeChange } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const connectedAccount = useConnectedAccount();
  const hitSlop = useHitSlopSize(60);
  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);

  const onPressSortBy = useCallback(() => {
    setIsHotIntervalBottomSheetOpen(true);
  }, []);

  return (
    <Stack>
      {isDarkMode && <PolarLightBackground activeIndex={activeIndex}/>}
      <HeaderAnimatedLayout type={type} onPressSortBy={onPressSortBy} expanded={isExpandedAnimValue}>
        <XStack marginHorizontal="$3" gap="$4" height={HeaderTabHeight}>
          {
            Object.values(feedTypes).map((type, index) => {
              if (type === feedTypes.FOLLOWING && (!connectedAccount || isSearching)) {
                return null;
              }

              const content = {
                [feedTypes.LATEST]: i18n.t("Latest"),
                [feedTypes.HOTTEST]: i18n.t("Hottest"),
                [feedTypes.FOLLOWING]: i18n.t("Following"),
              }[type];

              const isActive = activeIndex === index;

              return (
                <TouchableOpacity
                  key={type}
                  onLayout={hitSlop.onLayout}
                  hitSlop={hitSlop.hitSlop}
                  onPress={() => {
                    // TODO: Too many sync operations in fetching functions of feed list
                    setTimeout(() => {
                      onFeedTypeChange(type);
                    }, 50);
                    setActiveIndex(index);
                    if (type === feedTypes.FOLLOWING) {
                      const isHotActive = activeIndex === 1;
                      isHotActive
                        ? setIsHotIntervalBottomSheetOpen(true)
                        : onFeedTypeChange(feedTypes.HOTTEST);
                    }
                    GA.logEvent("feed_type_changed", { feed_type: type });
                  }}
                >
                  <Stack height={50} justifyContent="flex-end">
                    <Text color={isActive ? "$color" : "#8F8F91"} fontSize={isActive ? 36 : 16} lineHeight={isActive ? 36 : 26} fontWeight={isActive ? "bold" : "normal"}>
                      {content}
                    </Text>
                  </Stack>
                </TouchableOpacity>
              );
            })
          }
        </XStack>
      </HeaderAnimatedLayout>

      <HotInterval
        open={isHotIntervalBottomSheetOpen}
        value={daysInterval.toString()}
        onOpenChange={setIsHotIntervalBottomSheetOpen}
        onValueChange={(value) => {
          setIsHotIntervalBottomSheetOpen(false);
          onDaysIntervalChange(Number(value));
        }}
      />
    </Stack>
  );
};
