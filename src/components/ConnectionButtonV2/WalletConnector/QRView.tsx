import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  useColorScheme,
} from "react-native";

import * as Clipboard from "expo-clipboard";

import { DarkTheme, LightTheme } from "@/constants/colors";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "@/constants/platform";

import NavigationHeader from "./NavigationHeader";
import QRCode from "./QRCode";

import CopyIcon from "../../../assets/Copy.png";

interface Props {
  uri?: string
  onBackPress: () => void
}

function QRView({ uri, onBackPress }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDarkMode = useColorScheme() === "dark";

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(uri!);
    Alert.alert("Copied to clipboard");
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <NavigationHeader
        title="Scan the code"
        onBackPress={onBackPress}
        actionIcon={CopyIcon}
        onActionPress={copyToClipboard}
        actionDisabled={!uri}
      />
      {uri
        ? (
          <QRCode
            uri={uri}
            size={DEVICE_WIDTH * 0.9}
            theme={isDarkMode ? "dark" : "light"}
          />
        )
        : (
          <ActivityIndicator
            style={styles.loader}
            color={isDarkMode ? LightTheme.accent : DarkTheme.accent}
          />
        )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },
  loader: {
    height: DEVICE_HEIGHT * 0.4,
  },
});

export default QRView;
