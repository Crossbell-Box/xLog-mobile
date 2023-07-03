import type { FC } from "react";
import { useState } from "react";
import Animated from "react-native-reanimated";

import * as Haptics from "expo-haptics";

import { FeedList } from "@/components/FeedList";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";

import { AnimatedConnectionButton } from "./AnimatedConnectionButton";
import type { FeedType } from "./Header";
import { Header, feedType } from "./Header";

export interface Props {
  feedType?: FeedType
}

export const FeedPage: FC<Props> = (props) => {
  const { feedType: _feedType = feedType.LATEST } = props;
  const [currentSortType, setCurrentFeedType] = useState<FeedType>(_feedType);
  const [daysInterval, setDaysInterval] = useState<number>(7);
  const {
    isExpandedAnimValue,
    ...scrollVisibilityHandler
  } = useScrollVisibilityHandler({ scrollThreshold: 50 });

  return (
    <Animated.View style={{ flex: 1 }}>
      <Header
        currentFeedType={currentSortType}
        isExpandedAnimValue={isExpandedAnimValue}
        onDaysIntervalChange={(days) => {
          setDaysInterval(days);
        }}
        daysInterval={daysInterval}
        onFeedTypeChange={(type) => {
          setCurrentFeedType(type);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />
      <FeedList
        daysInterval={daysInterval}
        type={currentSortType}
        {...scrollVisibilityHandler}
      />
      <AnimatedConnectionButton visibleAnimValue={isExpandedAnimValue} />
    </Animated.View>
  );
};
