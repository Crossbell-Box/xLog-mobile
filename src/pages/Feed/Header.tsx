import type { FC } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";

import { Search } from "@tamagui/lucide-icons";
import { ScrollView, Stack, Text, XStack } from "tamagui";

import { PolarLightBackground } from "@/components/PolarLightBackground";
import { XTouch } from "@/components/XTouch";
import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { useIsLogin } from "@/hooks/use-is-login";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useThemeStore } from "@/hooks/use-theme-store";
import { HeaderAnimatedLayout, homeTabHeaderHeight } from "@/pages/Feed/HeaderAnimatedLayout";
import { GA } from "@/utils/GA";

import { postSearchTypes, shortsSearchTypes } from "./feedTypes";
import type { ShortsSearchType, PostSearchType } from "./feedTypes";
import { HotInterval } from "./HotInterval";

export interface Props {
  isExpandedAnimValue: Animated.SharedValue<number>
  daysInterval: number
  type?: PostSearchType | ShortsSearchType
  onFeedTypeChange: (type: PostSearchType | ShortsSearchType) => void
  onDaysIntervalChange: (days: number) => void
  isSearching?: boolean
}

export const Header: FC<Props> = (props) => {
  const { daysInterval, isSearching, type, onDaysIntervalChange } = props;
  const i18n = useTranslation("translation");
  const { isDarkMode } = useThemeStore();
  const { isExpandedAnimValue, onFeedTypeChange } = props;
  const [activeIndex, setActiveIndex] = useState(0);
  const isLogin = useIsLogin();
  const hitSlop = useHitSlopSize(60);
  const navigation = useRootNavigation();
  const [isHotIntervalBottomSheetOpen, setIsHotIntervalBottomSheetOpen] = useState(false);
  const onPressSortBy = useCallback(() => setIsHotIntervalBottomSheetOpen(true), []);

  return (
    <Stack height={90}>
      {isDarkMode && <PolarLightBackground activeIndex={activeIndex}/>}
      <HeaderAnimatedLayout type={type} onPressSortBy={onPressSortBy} expanded={isExpandedAnimValue}>
        <XStack marginHorizontal="$3" height={homeTabHeaderHeight} justifyContent="space-between">
          <ScrollView horizontal flex={1}>
            <XStack flex={1} gap="$4">
              {
                Object.values(
                  type === "shorts"
                    ? shortsSearchTypes
                    : postSearchTypes,
                ).map((type, index) => {
                  if (type === postSearchTypes.FOLLOWING && (!isLogin || isSearching)) {
                    return null;
                  }

                  const content = i18n.t(String(type.slice(0, 1).toUpperCase() + type.slice(1)));
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
            <XTouch enableHaptics onPress={() => { navigation.navigate("Explore"); }}>
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
