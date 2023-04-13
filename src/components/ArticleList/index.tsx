import { useComposedScrollHandler } from "@/hooks/useComposedScrollHandler";
import { FC, forwardRef, useImperativeHandle } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import Animated, { useAnimatedReaction, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { Stack } from "tamagui";
import { ArticleListItem, Props as ArticleListItemProps } from "./ArticleListItem";

export interface Props {
    onScroll?: ReturnType<typeof useAnimatedScrollHandler>
    onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

export interface ArticleListInstance { }

const data = Array.from({ length: 20 }).map((_, index) => ({ title: `Article ${index}` }))

export const ArticleList = forwardRef<ArticleListInstance, Props>((props, ref) => {
    const onScrollHandler = useComposedScrollHandler([props.onScroll]);

    return <Animated.FlatList<ArticleListItemProps>
        // TODO
        data={data}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item, index }) => {
            return <Stack key={index} marginBottom={'$3'} >
                <ArticleListItem {...item} />
            </Stack>
        }}
        windowSize={3}
        scrollEventThrottle={16}
        onScroll={onScrollHandler}
        showsVerticalScrollIndicator={false}
        onScrollEndDrag={props.onScrollEndDrag}
    />
})