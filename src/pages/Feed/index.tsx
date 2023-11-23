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
import { GlobalStateContext } from "@/context/global-state-context";
import { useColors } from "@/hooks/use-colors";
import type { HomeBottomTabsParamList } from "@/navigation/types";

import { postSearchTypes } from "./feedTypes";
import type { ShortsSearchType, PostSearchType } from "./feedTypes";
import { Header } from "./Header";
import { extraGapBetweenIOSAndAndroid, homeTabHeaderHeight } from "./HeaderAnimatedLayout";
import { ShortsExplorerBanner } from "./ShortsExplorerBanner";

export interface Props {
  type: PostSearchType | ShortsSearchType
  isShorts?: boolean
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
  const { isShorts, type: _type = postSearchTypes.FEATURED } = props.route.params;
  const [_currentFeedType, setCurrentFeedType] = useState<PostSearchType | ShortsSearchType>(_type);
  const currentFeedType = isShorts ? "shorts" : _currentFeedType;
  const [daysInterval, setDaysInterval] = useState<number>(7);
  const { isExpandedAnimValue, onScroll } = useContext(GlobalStateContext).homeFeed;
  const { top } = useSafeAreaInsets();

  const containerAnimStyles = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      isExpandedAnimValue.value,
      [0, 1],
      [0, homeTabHeaderHeight + top],
      Extrapolate.CLAMP,
    ) + extraGapBetweenIOSAndAndroid;

    return {
      height: height - headerHeight,
    };
  }, [top, isExpandedAnimValue]);

  const innerMaskContainerAnimStyles = useAnimatedStyle(() => {
    const paddingTop = interpolate(
      isExpandedAnimValue.value,
      [0, 1],
      [0, top],
      Extrapolate.CLAMP,
    ) + extraGapBetweenIOSAndAndroid;

    return {
      paddingTop,
      height,
    };
  }, [top, isExpandedAnimValue]);

  return (
    <Stack flex={1}>
      <FeedListLinearGradientBackground/>
      <Header
        type={currentFeedType as any}
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
      {/* 合并成一个 */}
      <Animated.View style={[styles.maskContainer, containerAnimStyles]}>
        <Animated.View style={[styles.maskContainer, innerMaskContainerAnimStyles]}>
          <MasonryFeedList
            daysInterval={daysInterval}
            type={currentFeedType}
            ListHeaderComponent={!isShorts && <ShortsExplorerBanner/>}
            onScroll={onScroll}
            contentContainerStyle={{
              paddingTop: 50,
            }}
          />
        </Animated.View>
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
  innerMaskContainer: {
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  commonContainer: {
    flex: 1,
  },
});
