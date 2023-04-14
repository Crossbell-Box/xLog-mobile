import { useComposedScrollHandler } from "@/hooks/useComposedScrollHandler";
import { FC, forwardRef, useImperativeHandle } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, { useAnimatedReaction, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { Stack } from "tamagui";
import { FeedListItem, Props as FeedListItemProps } from "./FeedListItem";

export interface Props {
    onScroll?: ReturnType<typeof useAnimatedScrollHandler>
    onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export interface FeedListInstance { }

const data = Array.from({ length: 20 }).map((_, index) => ({ title: `Feed ${index}` }))

export const FeedList = forwardRef<FeedListInstance, Props>((props, ref) => {
    const onScrollHandler = useComposedScrollHandler([props.onScroll]);

    return <Animated.FlatList<FeedListItemProps>
        // TODO
        data={data}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => {
            return <Stack key={index} marginBottom={'$3'} >
                <FeedListItem {...item} />
            </Stack>
        }}
        windowSize={3}
        scrollEventThrottle={16}
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={props.onScrollEndDrag}
    />
})