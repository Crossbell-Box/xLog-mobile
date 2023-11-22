import { useState, type FC, type PropsWithChildren, useCallback, useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, { interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";

import * as SplashScreen from "expo-splash-screen";

import { LogoDark } from "@/constants/resource";
import { SplashContext } from "@/context/splash-context";

const { width } = Dimensions.get("window");
const size = width / 2.83;

export const SplashProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const logoAnimVal = useSharedValue<number>(1);
  const containerAnimVal = useSharedValue<number>(1);

  const hideSplash = useCallback(() => {
    logoAnimVal.value = withSequence(
      withSpring(1.5, { duration: 400 }),
      withTiming(0, { duration: 200 }),
    );

    containerAnimVal.value = withDelay(
      400,
      withTiming(
        0,
        {
          duration: 500,
        },
        () => runOnJS(setIsSplashVisible)(false),
      ),
    );
  }, []);

  const logoAnimStyles = useAnimatedStyle(() => {
    return {
      width: size,
      height: size,
      opacity: interpolate(logoAnimVal.value, [0, 1], [0, 1]),
    };
  }, []);

  const containerAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(containerAnimVal.value, [0, 1], [0, 1]),
    };
  }, []);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SplashContext.Provider value={{ hideSplash, isSplashVisible }}>
      {children}
      {
        isSplashVisible && (
          <Animated.View style={[styles.container, containerAnimStyles]}>
            <Animated.Image style={logoAnimStyles} source={LogoDark} />
          </Animated.View>
        )
      }
    </SplashContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
});
