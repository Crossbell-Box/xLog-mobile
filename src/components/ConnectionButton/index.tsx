import { useDrawerProgress } from "@react-navigation/drawer"
import * as Haptics from "expo-haptics";
import { Plug } from "@tamagui/lucide-icons"
import { FC, useCallback } from "react"
import Animated, { interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button, useWindowDimensions } from "tamagui"

interface Props { }

export const ConnectionButton: FC<Props> = (props) => {
    const { bottom } = useSafeAreaInsets()
    const { width } = useWindowDimensions()

    const onPress = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, [])

    const progressAnimValue = useDrawerProgress() as SharedValue<number>
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(progressAnimValue.value || 0, [0, 1], [0, -width / 2]),
            },
        ],
    }), [width])

    return <Animated.View style={[
        animatedStyle,
        {
            position: "absolute",
            bottom: bottom + 12,
            left: 24,
            right: 24,
        }
    ]}>
        <Button
            size={'$5'}
            pressStyle={{ opacity: 0.85 }}
            color={'white'}
            fontSize={'$6'}
            backgroundColor={'black'}
            onPress={onPress}
            icon={<Plug size={'$1.5'} />}
        >
            Connect
        </Button>
    </Animated.View>
}
