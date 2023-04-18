import { FC, useState } from "react";
import Animated, { useAnimatedScrollHandler, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FeedList } from "@/components/FeedList";
import type { SortType } from "./Header";
import { Header, sortType } from "./Header";

export interface Props {
    sortType?: any
}

export const FeedPage: FC<Props> = (props) => {
    const { sortType: _sortType = sortType.LATEST } = props
    const [currentSortType, setCurrentSortType] = useState<SortType>(_sortType)
    const prevTranslationYAnimValue = useSharedValue<number>(0);
    const isExpandedAnimValue = useSharedValue<0 | 1>(1);

    const onScroll = useAnimatedScrollHandler((event) => {
        const edge = 50;
        if (isExpandedAnimValue.value !== 0 && isExpandedAnimValue.value !== 1) {
            return
        }

        if (
            event.contentOffset.y - prevTranslationYAnimValue.value > edge &&
            isExpandedAnimValue.value !== 0
        ) {
            // Hiding the connection button
            isExpandedAnimValue.value = withSpring(0)
        } else if (
            event.contentOffset.y - prevTranslationYAnimValue.value < -edge &&
            isExpandedAnimValue.value !== 1
        ) {
            // Showing the connection button
            isExpandedAnimValue.value = withSpring(1)
        }
    });

    const onScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        prevTranslationYAnimValue.value = e.nativeEvent.contentOffset.y
    }

    return <Animated.View style={{ flex: 1 }}>
        <Header
            currentSortType={currentSortType}
            isExpandedAnimValue={isExpandedAnimValue}
            onSortTypeChange={(type) => {
                setCurrentSortType(type)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            }}
        />
        <FeedList type={currentSortType} onScroll={onScroll} onScrollEndDrag={onScrollEndDrag} />
        {/* TODO */}
        {/* <AnimatedConnectionButton visibleAnimValue={isExpandedAnimValue} /> */}
    </Animated.View>
}
