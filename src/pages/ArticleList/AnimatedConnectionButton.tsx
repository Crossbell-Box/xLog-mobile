import { FC } from "react";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { ConnectionButton } from "@/components/ConnectionButton";

export const AnimatedConnectionButton: FC<{
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