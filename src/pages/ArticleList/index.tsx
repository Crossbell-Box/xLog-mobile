import { FC, useMemo, useRef, useState } from "react";
import Animated, { interpolate, measure, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { Button, TamaguiElement, Text, useCurrentColor, XStack, YStack } from "tamagui";
import * as Haptics from "expo-haptics";
import { ConnectButton } from "@/components/ConnectButton";


export enum SortType {
    LATEST = 'latest',
    POPULAR = 'popular',
    FOLLOW = 'follow'
}

export interface Props {
    sortType?: SortType
}

const NameOfSortType = {
    [SortType.LATEST]: '最新',
    [SortType.POPULAR]: '最热',
    [SortType.FOLLOW]: '关注'
}

export const ArticleList: FC<Props> = (props) => {
    const { sortType = SortType.LATEST } = props
    const primaryColor = useCurrentColor('orange9')
    const [currentSortType, setCurrentSortType] = useState(sortType)
    const indicatorAnimValuePos = useSharedValue(0)
    const buttonWidth = 80

    const indicatorAnimStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: interpolate(indicatorAnimValuePos.value, [0, 1, 2], [0, buttonWidth, 2 * buttonWidth])
                }
            ]
        }
    }, [currentSortType])


    return <YStack flex={1}>
        <YStack>
            <XStack>
                {
                    Object.values(SortType).map((type) => {
                        const isActive = type === currentSortType
                        return <Button
                            key={type}
                            size="$5"
                            marginTop={10}
                            width={buttonWidth}
                            height={buttonWidth / 2}
                            unstyled
                            onPress={() => {
                                setCurrentSortType(type)
                                indicatorAnimValuePos.value = withTiming(Object.values(SortType).indexOf(type))
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
                    })
                }
            </XStack>
            <Animated.View style={[indicatorAnimStyle, { borderBottomWidth: 2, width: 50, marginLeft: 15, borderColor: primaryColor }]} />
        </YStack>
        <ConnectButton />
    </YStack>
}