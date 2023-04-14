import { FC } from "react";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import { ConnectionButton } from "@/components/ConnectionButton";
import { useDrawerProgress } from "@react-navigation/drawer";
import { useWindowDimensions } from "tamagui";

export const AnimatedConnectionButton: FC<{
    visibleAnimValue?: Animated.SharedValue<number>
}> = (props) => {
    const { visibleAnimValue } = props
    const { width } = useWindowDimensions()
    const drawerProgressAnimValue = useDrawerProgress() as Animated.SharedValue<number>

    const connectButtonAnimStyle = useAnimatedStyle(() => {
        const aimValue = visibleAnimValue?.value ?? 0;

        const opacity = interpolate(aimValue, [0, 1], [0, 1], Animated.Extrapolate.CLAMP);
        const translateY = interpolate(aimValue, [0, 1], [100, 0], Animated.Extrapolate.CLAMP);
        const translateX = interpolate(drawerProgressAnimValue.value, [0, 1], [0, width / 2], Animated.Extrapolate.CLAMP);


        return {
            opacity,
            transform: [
                { translateY },
                { translateX },
            ],
        };
    }, [width])

    return <Animated.View style={connectButtonAnimStyle}>
        <ConnectionButton />
    </Animated.View>
}