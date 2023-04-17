import { Logo } from "@/constants/resource";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { FC } from "react";
import { Text, useWindowDimensions, XStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Extrapolate, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { Image } from "expo-image";

export interface Props {
    expanded: SharedValue<0 | 1>
}

export const NavigationHeader: FC<Props> = (props) => {
    const { expanded } = props
    const { top } = useSafeAreaInsets()
    const { width } = useWindowDimensions()

    const containerAnimStyles = useAnimatedStyle(() => {
        return {
            height: interpolate(expanded.value, [0, 1], [top, top + 35]),
        }
    }, [top, expanded])

    const contentContainerAnimStyles = useAnimatedStyle(() => {
        return {
            bottom: interpolate(expanded.value, [0, 1], [-42, 0], Extrapolate.CLAMP),
            right: 0,
            width: interpolate(expanded.value, [0, 1], [100, width], Extrapolate.CLAMP),
            transform: [
                {
                    scale: interpolate(expanded.value, [0, 1], [0.7, 1], Extrapolate.CLAMP)
                }
            ]
        }
    }, [expanded, width])

    return <Animated.View style={[containerAnimStyles, styles.container, { paddingTop: top }]}>
        <Animated.View style={[contentContainerAnimStyles, styles.contentContainer]}>
            <Image source={Logo} contentFit={'contain'} style={styles.logo} />
            <Text fontWeight={'700'} fontSize={24}>xLog</Text>
        </Animated.View>
    </Animated.View>
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    contentContainer: {
        position: "absolute",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    logo: {
        width: 32,
        height: 32,
    }
});