import { useDrawerProgress } from "@react-navigation/drawer"
import { useNavigation } from "@react-navigation/native"
import { Plug } from "@tamagui/lucide-icons"
import { FC, useCallback } from "react"
import Animated, { interpolate, SharedValue, useAnimatedReaction, useAnimatedStyle } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button } from "tamagui"

interface Props { }

export const ConnectButton: FC<Props> = (props) => {
    const { bottom } = useSafeAreaInsets()

    const onPress = useCallback(() => { }, [])
    const progressAnimValue = useDrawerProgress() as SharedValue<number>

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: interpolate(progressAnimValue.value || 0, [0, 1], [0, -100])
            }
        ]
    }), [])

    return <Animated.View style={[
        animatedStyle,
        {
            position: 'absolute',
            bottom: bottom + 20,
            left: 40,
        }
    ]}>
        <Button
            pressStyle={{ opacity: 0.5 }}
            circular
            color={'white'}
            backgroundColor={'black'}
            onPress={onPress}
            borderRadius={'$9'}
            icon={Plug}
            zIndex={99}
            width={'$10'}
            height={'$10'}
        />
    </Animated.View>
}
