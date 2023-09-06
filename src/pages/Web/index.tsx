import type { FC } from "react";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import WebView from "react-native-webview";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import type { RootStackParamList } from "@/navigation/types";

export interface Props {
  url: string
  title?: string
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const WebPage: FC<NativeStackScreenProps<RootStackParamList, "Web">> = (props) => {
  const { navigation, route } = props;
  const { url, title } = route.params;
  const progressAnim = useSharedValue<number>(0);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnim.value * 100}%`,
      opacity: progressAnim.value === 1 ? 0 : 1,
      position: "absolute",
      top: 0,
      zIndex: 2,
    };
  });

  useEffect(() => {
    navigation.setOptions({
      title,
    });
  }, []);

  return (
    <View style={styles.container}>
      <AnimatedView style={[styles.progressBar, progressStyle]} >
        <LinearGradient
          colors={["#30a19b", "#2875bf"]}
          style={{ position: "absolute", width: "100%", top: 0, bottom: 0 }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
      </AnimatedView>
      <WebView
        source={{ uri: url }}
        onLoadProgress={({ nativeEvent }) => progressAnim.value = withTiming(nativeEvent.progress)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBar: {
    height: 3,
    overflow: "hidden",
  },
});
