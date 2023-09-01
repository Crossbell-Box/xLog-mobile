import type { FC } from "react";
import { useContext, useState } from "react";
import Animated from "react-native-reanimated";

import * as Haptics from "expo-haptics";
import { Stack } from "tamagui";

import { MasonryFeedList } from "@/components/FeedList";
import { GlobalAnimationContext } from "@/context/global-animation-context";

import type { FeedType } from "./feedTypes";
import { feedTypes } from "./feedTypes";
import { Header } from "./Header";

export interface Props {
  feedType?: FeedType
}

export const FeedPage: FC<Props> = (props) => {
  const { feedType: _feedType = feedTypes.LATEST } = props;
  const [currentFeedType, setCurrentFeedType] = useState<FeedType>(_feedType);
  const [daysInterval, setDaysInterval] = useState<number>(7);
  const { isExpandedAnimValue, onScroll } = useContext(GlobalAnimationContext).homeFeed;

  return (
    <Animated.View style={{ flex: 1, backgroundColor: "black" }}>
      <Header
        type={currentFeedType}
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
      <Stack flex={1}>
        <MasonryFeedList
          daysInterval={daysInterval}
          type={currentFeedType}
          onScroll={onScroll}
        />
      </Stack>
    </Animated.View>
  );
};
