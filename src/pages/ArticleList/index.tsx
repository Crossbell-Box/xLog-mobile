import { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Animated, { interpolate, measure, useAnimatedGestureHandler, useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Button, isWeb, TamaguiElement, Text, useCurrentColor, XStack, YStack } from "tamagui";
import * as Haptics from "expo-haptics";
import { ConnectionButton } from "@/components/ConnectionButton";
import { i18n } from "@/i18n/setup";
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native";
import { ArticleList, ArticleListInstance } from "@/components/ArticleList";
import { PanGestureHandler } from "react-native-gesture-handler";
import { NavigationHeader } from "@/components/Header";


export enum SortType {
    LATEST = 'latest',
    POPULAR = 'popular',
    FOLLOW = 'follow'
}

export interface Props {
    sortType?: SortType
}

const NameOfSortType = {
    [SortType.LATEST]: i18n.t('latest'),
    [SortType.POPULAR]: i18n.t('popular'),
    [SortType.FOLLOW]: i18n.t('follow')
}

const lengthOfSortType = Object.values(SortType).length

export const ArticleListPage: FC<Props> = (props) => {
    const { sortType = SortType.LATEST } = props
    const primaryColor = useCurrentColor('orange9')
    const [currentSortType, setCurrentSortType] = useState(sortType)
    const indicatorAnimValuePos = useDerivedValue(() => withTiming(Object.values(SortType).indexOf(currentSortType)), [currentSortType]);
    const [buttonMeasurements, setButtonMeasurements] = useState<Array<Partial<{ x: number, width: number }>>>([])

    const indicatorAnimStyle = useAnimatedStyle(() => {
        const lengthMeasured = buttonMeasurements.filter((m) => !!m).length
        if ((_WORKLET || isWeb) && lengthMeasured === lengthOfSortType) {
            const width = interpolate(
                indicatorAnimValuePos.value,
                [0, 1, 2],
                buttonMeasurements.map((m) => (m?.width ?? 0) / 2)
            )

            return {
                width,
                opacity: 1,
                left: interpolate(
                    indicatorAnimValuePos.value,
                    [0, 1, 2],
                    buttonMeasurements.map((m) => m?.x ?? 0)
                ),
                transform: [
                    {
                        translateX: width / 2
                    }
                ]
            }
        }

        return {
            opacity: 0
        }
    }, [currentSortType, buttonMeasurements])

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
        <NavigationHeader expanded={isExpandedAnimValue} />
        <YStack elevation={5} shadowColor="#000" shadowOffset={{ width: 0, height: 4 }} shadowOpacity={0.2} shadowRadius={4.65}>
            <XStack>
                {
                    Object.values(SortType).map((type, index) => {
                        const isActive = type === currentSortType
                        return <View key={type} onLayout={({ nativeEvent: { layout: { width, x } } }) => {
                            setButtonMeasurements((prev) => {
                                const newButtonMeasurements = [...prev]
                                newButtonMeasurements[index] = { width, x }
                                return newButtonMeasurements
                            })
                        }}>
                            <Button
                                size="$5"
                                marginTop={5}
                                height={40}
                                unstyled
                                padding={12}
                                onPress={() => {
                                    setCurrentSortType(type)
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                                }}
                            >
                                <Text
                                    color={isActive ? primaryColor : '#6B7280'}
                                    fontWeight={isActive ? 'bold' : 'normal'}
                                >
                                    {NameOfSortType[type]}
                                </Text>
                            </Button>
                        </View>
                    })
                }
            </XStack>
            <Animated.View style={[indicatorAnimStyle, { borderBottomWidth: 2, borderColor: primaryColor }]} />
        </YStack>
        <ArticleList onScroll={onScroll} onScrollEndDrag={onScrollEndDrag} />
        <AnimatedConnectionButton visibleAnimValue={isExpandedAnimValue} />
    </Animated.View>
}

const AnimatedConnectionButton: FC<{
    visibleAnimValue?: Animated.SharedValue<number>
}> = (props) => {
    const { visibleAnimValue } = props

    const connectButtonAnimStyle = useAnimatedStyle(() => {
        const aimValue = visibleAnimValue?.value ?? 0;

        const opacity = interpolate(aimValue, [0, 1], [0, 1], Animated.Extrapolate.CLAMP);
        const translateY = interpolate(aimValue, [0, 1], [100, 0], Animated.Extrapolate.CLAMP);


        return {
            opacity,
            transform: [
                {
                    translateY
                },
            ],
        };
    }, [])

    return <Animated.View style={connectButtonAnimStyle}>
        <ConnectionButton />
    </Animated.View>
}

const styles = StyleSheet.create({
    tabs: {
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4.65,
    }
})
