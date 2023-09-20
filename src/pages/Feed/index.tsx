import type { FC } from "react";
import { useContext, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "tamagui";

import { MasonryFeedList } from "@/components/FeedList";
import { GlobalAnimationContext } from "@/context/global-animation-context";
import { useColors } from "@/hooks/use-colors";
import type { SourceType } from "@/models/home.model";
import type { HomeBottomTabsParamList } from "@/navigation/types";

import { searchTypes, type SearchType } from "./feedTypes";
import { Header } from "./Header";

export interface Props {
  sourceType: SourceType
  searchType: SearchType
}

const { height } = Dimensions.get("window");

export const FeedListLinearGradientBackground: FC = () => {
  const { pick } = useColors();
  return (
    <LinearGradient
      colors={[pick("homeFeedBackgroundGradient_0"), pick("homeFeedBackgroundGradient_1")]}
      style={StyleSheet.absoluteFillObject}
      locations={[0, 0.35]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    />
  );
};

export const FeedPage: FC<NativeStackScreenProps<HomeBottomTabsParamList, "Feed">> = (props) => {
  const { sourceType, searchType: _searchType = searchTypes.LATEST } = props.route.params;
  const [currentFeedType, setCurrentFeedType] = useState<SearchType>(_searchType);
  const [daysInterval, setDaysInterval] = useState<number>(7);
  const { isExpandedAnimValue, onScroll } = useContext(GlobalAnimationContext).homeFeed;
  const { top } = useSafeAreaInsets();

  const containerAnimStyles = useAnimatedStyle(() => {
    const headerHeight = interpolate(isExpandedAnimValue.value, [0, 1], [55, 110], Extrapolate.CLAMP) + top;
    return {
      height: height - headerHeight,
    };
  }, [top, isExpandedAnimValue]);

  return (
    <Stack flex={1} >
      <FeedListLinearGradientBackground/>
      <Header
        sourceType={sourceType}
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
      <Animated.View style={[styles.maskContainer, containerAnimStyles]}>
        <Stack paddingTop={60 + top} height={height} width={"100%"} position="absolute" bottom={0}>
          <MasonryFeedList
            sourceType={sourceType}
            daysInterval={daysInterval}
            searchType={currentFeedType}
            onScroll={onScroll}
            contentContainerStyle={{
              paddingTop: 50,
            }}
          />
        </Stack>
      </Animated.View>
    </Stack>
  );
};

const styles = StyleSheet.create({
  maskContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    overflow: "hidden",
  },
});
