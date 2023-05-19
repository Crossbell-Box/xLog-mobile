import type { FC } from "react";
import { useState } from "react";
import Animated from "react-native-reanimated";

import * as Haptics from "expo-haptics";

import { FeedList } from "@/components/FeedList";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";

import { AnimatedConnectionButton } from "./AnimatedConnectionButton";
import type { SortType } from "./Header";
import { Header, sortType } from "./Header";

export interface Props {
  sortType?: any
}

export const FeedPage: FC<Props> = (props) => {
  const { sortType: _sortType = sortType.LATEST } = props;
  const [currentSortType, setCurrentSortType] = useState<SortType>(_sortType);
  const [daysInterval, setDaysInterval] = useState<number>(7);
  const {
    isExpandedAnimValue,
    ...scrollVisibilityHandler
  } = useScrollVisibilityHandler({ scrollThreshold: 50 });

  return (
    <Animated.View style={{ flex: 1 }}>
      <Header
        currentSortType={currentSortType}
        isExpandedAnimValue={isExpandedAnimValue}
        onDaysIntervalChange={(days) => {
          setDaysInterval(days);
        }}
        daysInterval={daysInterval}
        onSortTypeChange={(type) => {
          setCurrentSortType(type);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />
      <FeedList daysInterval={daysInterval} type={currentSortType} {...scrollVisibilityHandler}/>
      <AnimatedConnectionButton visibleAnimValue={isExpandedAnimValue} />
    </Animated.View>
  );
};
