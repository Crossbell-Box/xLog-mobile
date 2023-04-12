import { FC, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import Animated, { interpolate, measure, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Button, isWeb, TamaguiElement, Text, useCurrentColor, XStack, YStack } from "tamagui";
import * as Haptics from "expo-haptics";
import { ConnectButton } from "@/components/ConnectButton";
import { i18n } from "@/i18n/setup";
import { View } from "react-native";


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

export const ArticleList: FC<Props> = (props) => {
    const { sortType = SortType.LATEST } = props
    const primaryColor = useCurrentColor('orange9')
    const [currentSortType, setCurrentSortType] = useState(sortType)
    const indicatorAnimValuePos = useDerivedValue(() => withTiming(Object.values(SortType).indexOf(currentSortType)), [currentSortType]);
    const [buttonMeasurements, setButtonMeasurements] = useState<Array<Partial<{ x: number, width: number }>>>([])

    const indicatorAnimStyle = useAnimatedStyle(() => {
        const lengthMeasured = buttonMeasurements.filter((m) => !!m).length
        if ((_WORKLET || isWeb) && lengthMeasured === Object.values(SortType).length) {
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

    return <YStack flex={1}>
        <YStack>
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
                                marginTop={10}
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
        <ConnectButton />
    </YStack>
}