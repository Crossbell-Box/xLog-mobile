import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { XTouch } from "@/components/XTouch";
import { DarkTheme, LightTheme } from "@/constants/colors";

import Chevron from "../../../assets/Chevron.png";

interface Props {
  title: string
  onBackPress?: () => void
  onActionPress?: () => void
  actionIcon?: any
  actionIconStyle?: any
  actionDisabled?: boolean
}

function NavigationHeader({
  title,
  onBackPress,
  onActionPress,
  actionIcon,
  actionIconStyle,
  actionDisabled,
}: Props) {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      {onBackPress
        ? (
          <XTouch
            hitSlopSize={44}
            touchableComponent={TouchableOpacity}
            style={styles.button}
            onPress={onBackPress}
            disabled={actionDisabled}
          >
            <Image style={styles.backIcon} source={Chevron} />
          </XTouch>
        )
        : (
          <View style={styles.button} />
        )}
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        {title}
      </Text>
      {actionIcon
        ? (
          <XTouch
            hitSlopSize={44}
            touchableComponent={TouchableOpacity}
            style={styles.button}
            onPress={onActionPress}
            disabled={actionDisabled}
          >
            <Image
              style={[actionIconStyle, actionDisabled && styles.actionDisabled]}
              source={actionIcon}
            />
          </XTouch>
        )
        : (
          <View style={styles.button} />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button: {
    width: 24,
    height: 24,
    justifyContent: "center",
  },
  backIcon: {
    width: 8,
    height: 18,
  },
  title: {
    fontWeight: "600",
    color: LightTheme.foreground1,
    fontSize: 20,
    lineHeight: 24,
  },
  titleDark: {
    color: DarkTheme.foreground1,
  },
  // Handle better when themes are added
  actionDisabled: {
    tintColor: LightTheme.foreground3,
  },
});

export default NavigationHeader;
