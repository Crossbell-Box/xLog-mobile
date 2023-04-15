import { FC, useMemo, useState } from "react";
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Button, isWeb, Stack, Text, useCurrentColor, XStack, YStack } from "tamagui";
import { i18n } from "@/i18n";
import { NavigationHeader } from "@/components/Header";
import { sortType, SortType } from "./constants";
import { StyleSheet } from "react-native";

export interface Props {
    isExpandedAnimValue: Animated.SharedValue<0 | 1>
    currentSortType: SortType
    onSortTypeChange: (type: SortType) => void
}

const NameOfSortType = {
    [sortType.LATEST]: i18n.t('latest'),
    [sortType.HOT]: i18n.t('hot'),
    [sortType.FOLLOWING]: i18n.t('following')
}

type Measurements = Array<Partial<{ x: number, width: number }>>

export const Header: FC<Props> = (props) => {
    const primaryColor = useCurrentColor('orange9')
    const lengthOfSortType = Object.values(sortType).length
    const { isExpandedAnimValue, currentSortType, onSortTypeChange } = props
    const [_measurements, setMeasurements] = useState<Measurements>([])
    const indicatorAnimValuePos = useDerivedValue(() => withTiming(Object.values(sortType).indexOf(currentSortType)), [currentSortType]);
    const measurements = useMemo<Measurements | undefined>(() => {
        if (_measurements.filter((m) => !!m).length === lengthOfSortType) {
            return _measurements
        }

        return undefined
    }, [_measurements])

    const indicatorAnimStyle = useAnimatedStyle(() => {
        if ((_WORKLET || isWeb) && measurements) {
            const width = interpolate(
                indicatorAnimValuePos.value,
                [0, 1, 2],
                measurements.map((m) => (m?.width ?? 0) / 2)
            )

            return {
                width,
                opacity: 1,
                left: interpolate(
                    indicatorAnimValuePos.value,
                    [0, 1, 2],
                    measurements.map((m) => m?.x ?? 0)
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
    }, [currentSortType, measurements])

    return <>
        <NavigationHeader expanded={isExpandedAnimValue} />
        <YStack borderBottomWidth={1} borderBottomColor={'$orange12Dark'}>
            <XStack>
                {
                    Object.values(sortType)
                    .filter((type) => type !== sortType.FOLLOWING) // TODO
                    .map((type, index) => {
                        const isActive = type === currentSortType
                        return <Stack key={type} onLayout={({ nativeEvent: { layout: { width, x } } }) => {
                            setMeasurements((prev) => {
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
                                    onSortTypeChange(type)
                                }}
                            >
                                <Text
                                    color={isActive ? primaryColor : '#6B7280'}
                                    fontWeight={isActive ? 'bold' : 'normal'}
                                >
                                    {NameOfSortType[type]}
                                </Text>
                            </Button>
                        </Stack>
                    })
                }
            </XStack>
            <Animated.View style={[indicatorAnimStyle, { borderBottomWidth: 2, borderColor: primaryColor }]} />
        </YStack>
    </>
}