import { RootStackParamList } from "@/navigation/types"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { FC } from "react"
import { StyleSheet } from "react-native"
import { WebView } from "@/components/WebView"
import { Stack, useWindowDimensions, XStack, YStack } from "tamagui"
import Animated, { interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import ContentLoader, { Rect, Circle, Facebook } from 'react-content-loader/native'
import { useColor } from "@/hooks/styles"

export interface Props {
    noteId: number
    characterId: number
}

export const PostDetailsPage: FC<NativeStackScreenProps<RootStackParamList, 'PostDetails'>> = (props) => {
    const { route } = props
    const { params } = route
    const { top } = useSafeAreaInsets()
    const { width, height } = useWindowDimensions()
    const webviewLoadingAnimValue = useSharedValue<number>(0);
    const { primary } = useColor()
    const [webviewLoaded, setWebviewLoaded] = React.useState(false)

    const webviewAnimStyles = useAnimatedStyle(() => {
        return {
            opacity: interpolate(webviewLoadingAnimValue.value, [0, 0.7], [0, 1])
        }
    }, [])

    const skeletonAnimStyles = useAnimatedStyle(() => {
        return {
            opacity: interpolate(webviewLoadingAnimValue.value, [0, 0.7], [1, 0])
        }
    }, [])

    useAnimatedReaction(
        () => webviewLoadingAnimValue.value === 1,
        (loaded) => runOnJS(setWebviewLoaded)(loaded),
        [webviewLoadingAnimValue.value]
    )

    return <Stack flex={1} backgroundColor={'white'}>
        <Animated.View style={[webviewAnimStyles, styles.webviewContainer]}>
            <WebView
                // TODO
                // Should replace it to another page that only contains the article content.
                source={{ uri: `https://xlog.app/api/redirection?characterId=${params.characterId}&noteId=${params.noteId}` }}
                style={styles.webview}
                onLoadProgress={({ nativeEvent }) => {
                    webviewLoadingAnimValue.value = withTiming(nativeEvent.progress)
                }}
            />
        </Animated.View>
        {
            !webviewLoaded && <Animated.View style={[skeletonAnimStyles, styles.skeletonContainer, { top }]} >
                <YStack flex={1} alignItems={"flex-start"} justifyContent={'flex-start'}>
                    <ContentLoader viewBox={`0 0 ${width - 10 * 2} ${height - top}`} backgroundColor={'gray'} opacity="0.3">
                        <Rect x="10" y="17" rx="4" ry="4" width={`${(width - 40) * 0.5}`} height="24" />
                        <Rect x="10" y="60" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="13" />
                        <Rect x={`${10 + (width - 40) * 0.25 + 10}`} y="60" rx="3" ry="3" width={`${(width - 40) * 0.35}`} height="13" />
                        <Rect x="10" y="90" rx="3" ry="3" width={`${(width - 40) * 0.6}`} height="24" />
                        <Rect x={`${10 + (width - 40) * 0.6 + 10}`} y="90" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="24" />
                        <Rect x={`${10 + (width - 40) * 0.28}`} y="140" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="24" />
                        <Rect x="10" y="140" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="24" />
                        <Rect x={`${10 + (width - 40) * 0.75}`} y="140" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="24" />
                        <Rect x="15" y="180" rx="3" ry="3" width={`${width - 35 * 2}`} height="1" />
                        <Rect x="10" y="220" rx="3" ry="3" width={`${(width - 40) * 0.5}`} height="36" />
                        <Rect x="10" y="270" rx="3" ry="3" width={`${(width - 40) * 0.25}`} height="13" />
                        <Rect x={`${10 + (width - 40) * 0.25 + 10}`} y="270" rx="3" ry="3" width={`${(width - 40) * 0.35}`} height="13" />
                        <Rect x="10" y="300" rx="3" ry="3" width={`${(width - 40) * 0.75}`} height="20" />
                        <Rect x="10" y="330" rx="3" ry="3" width={`${(width - 40)}`} height="20" />
                        <Rect x="10" y="360" rx="3" ry="3" width={`${(width - 40)}`} height="20" />
                        <Rect x="10" y="390" rx="3" ry="3" width={`${(width - 40)}`} height="20" />
                        <Rect x="10" y="420" rx="3" ry="3" width={`${(width - 40)}`} height="20" />
                        <Rect x="10" y="450" rx="3" ry="3" width={`${(width - 40) * 0.75}`} height="20" />
                    </ContentLoader>
                </YStack>
            </Animated.View>
        }
    </Stack>
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
    },
    webviewContainer: {
        backgroundColor: "white",
        flex: 1,
    },
    skeletonContainer: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "white"
    }
});
