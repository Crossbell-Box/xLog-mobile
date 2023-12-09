import type { FC } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useSharedValue, withSpring, useAnimatedStyle, Extrapolation, runOnUI, interpolate, runOnJS } from "react-native-reanimated";

import { Stack, Text, XStack } from "tamagui";

import { MeasureContainer } from "@/components/utils/MeasureContainer";
import { XTouch } from "@/components/XTouch";
import { useCommentCounts } from "@/hooks/use-comments-counts";
import { useGetLikeCounts } from "@/queries/page";

import { bottomSheetPadding } from "./constants";

export const BottomSheetTabBar: FC<{
  characterId: number
  noteId: number
  indexAnimVal: SharedValue<number>
  onPressTab?: (index: number) => void
}> = ({ characterId, noteId, indexAnimVal, onPressTab }) => {
  const tabsPos = useSharedValue<Array<{ x: number; width: number }>>([]);
  const i18n = useTranslation();

  const indicatorAnimStyles = useAnimatedStyle(() => {
    const input = [0, 1, 2];

    if (tabsPos.value.length !== input.length || tabsPos.value.some(pos => !pos)) {
      return {
        opacity: 0,
      };
    }

    return {
      opacity: 1,
      width: interpolate(
        indexAnimVal.value,
        input,
        tabsPos.value.map(pos => pos.width),
        Extrapolation.CLAMP,
      ),
      left: interpolate(
        indexAnimVal.value,
        input,
        tabsPos.value.map(pos => pos.x),
        Extrapolation.CLAMP,
      ),
    };
  }, [indexAnimVal, tabsPos]);

  const { data: likeCounts = 0 } = useGetLikeCounts({ characterId, noteId });
  const { data: commentCounts = 0 } = useCommentCounts({ characterId, noteId });

  const onPressActionTab = (index: number) => {
    "worklet";

    const springConfig = {
      damping: 10,
      mass: 0.5,
    };

    indexAnimVal.value = withSpring(index, springConfig);
    onPressTab && runOnJS(onPressTab)(index);
  };

  const initPos = (index: number, x: number, width: number) => {
    tabsPos.value[index] = { x, width };
    tabsPos.value = [...tabsPos.value];
  };

  return (
    <XStack justifyContent="space-between" paddingTop="$2" paddingHorizontal={bottomSheetPadding}>
      <XTouch enableHaptics onPress={() => runOnUI(onPressActionTab)(0)}>
        <MeasureContainer onDimensionsChange={({ pageX, width }) => initPos(0, pageX, width)}>
          <Text fontSize={"$6"}>{i18n.t("Data")}</Text>
        </MeasureContainer>
      </XTouch>
      <XStack gap="$5">
        <XTouch enableHaptics onPress={() => runOnUI(onPressActionTab)(1)}>
          <MeasureContainer onDimensionsChange={({ pageX, width }) => initPos(1, pageX, width)}>
            <XStack gap="$2">
              <Text fontSize={"$6"}>{i18n.t("Comment")}</Text>
              <Text fontSize={"$3"} fontWeight={"700"}>
                {commentCounts}
              </Text>
            </XStack>
          </MeasureContainer>
        </XTouch>
        <XTouch enableHaptics onPress={() => runOnUI(onPressActionTab)(2)}>
          <MeasureContainer onDimensionsChange={({ pageX, width }) => initPos(2, pageX, width)}>
            <XStack gap="$2">
              <Text fontSize={"$6"}>{i18n.t("Like")}</Text>
              <Text fontSize={"$3"} numberOfLines={1} fontWeight={"700"}>
                {likeCounts}
              </Text>
            </XStack>
          </MeasureContainer>
        </XTouch>
      </XStack>
      <Animated.View style={[indicatorAnimStyles, { position: "absolute", top: 35 }]}>
        <Stack backgroundColor={"$color"} height={2} width={"100%"}/>
      </Animated.View>
    </XStack>
  );
};

