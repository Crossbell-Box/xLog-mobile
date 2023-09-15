import type { FC } from "react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";

import { useConnectedAccount } from "@crossbell/react-account";
import { Search } from "@tamagui/lucide-icons";
import { ScrollView, Stack, Text, XStack } from "tamagui";

import { PolarLightBackground } from "@/components/PolarLightBackground";
import { XTouch } from "@/components/XTouch";
import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { SourceType } from "@/models/home.model";
import { HeaderAnimatedLayout } from "@/pages/Feed/HeaderAnimatedLayout";
import { GA } from "@/utils/GA";

import { searchTypes, type SearchType } from "./feedTypes";
import { HotInterval } from "./HotInterval";

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<number>
  daysInterval: number
  type?: SearchType
  sourceType: SourceType
  onFeedTypeChange: (type: SearchType) => void
  onDaysIntervalChange: (days: number) => void
  isSearching?: boolean
}

export const HeaderTabHeight = 60;

export const Header: FC<Props> = (props) => {
  const { daysInterval, sourceType, isSearching, type, onDaysIntervalChange } = props;
  const i18n = useTranslation("dashboard");
  const { isDarkMode } = useThemeStore();
  const { isExpandedAnimValue, onFeedTypeChange } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const connectedAccount = useConnectedAccount();
  const hitSlop = useHitSlopSize(60);
  const navigation = useRootNavigation();
  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);
  const onPressSortBy = useCallback(() => setIsHotIntervalBottomSheetOpen(true), []);

  return (
    <Stack height={90}>
      {isDarkMode && <PolarLightBackground activeIndex={activeIndex}/>}
      <HeaderAnimatedLayout type={type} onPressSortBy={onPressSortBy} expanded={isExpandedAnimValue}>
        <XStack marginHorizontal="$3" height={HeaderTabHeight} justifyContent="space-between">
          <ScrollView horizontal flex={1}>
            <XStack flex={1} gap="$4">
              {
                Object.values(searchTypes).map((type, index) => {
                  if (type === searchTypes.FOLLOWING && (!connectedAccount || isSearching)) {
                    return null;
                  }

                  const content = {
                    [searchTypes.LATEST]: i18n.t("Latest"),
                    [searchTypes.HOTTEST]: i18n.t("Hottest"),
                    [searchTypes.FOLLOWING]: i18n.t("Following"),
                  }[type];

                  const isActive = activeIndex === index;

                  return (
                    <TouchableOpacity
                      key={type}
                      onLayout={hitSlop.onLayout}
                      hitSlop={hitSlop.hitSlop}
                      onPress={() => {
                        // TODO: Too many sync operations in fetching functions of feed list
                        setTimeout(() => { onFeedTypeChange(type); }, 50);
                        setActiveIndex(index);
                        GA.logEvent("feed_type_changed", { feed_type: type });
                      }}
                    >
                      <Stack height={50} justifyContent="flex-end">
                        <Text
                          color={isActive ? "$color" : "#8F8F91"}
                          fontSize={isActive ? 36 : 16}
                          lineHeight={isActive ? 40 : 26}
                          fontWeight={isActive ? "bold" : "normal"}
                        >
                          {content}
                        </Text>
                      </Stack>
                    </TouchableOpacity>
                  );
                })
              }
            </XStack>
          </ScrollView>
          <Stack height={50} justifyContent="flex-end">
            <XTouch enableHaptics onPress={() => { navigation.navigate("Explore", { sourceType }); }}>
              <Search color={"$color"} size={24}/>
            </XTouch>
          </Stack>
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
