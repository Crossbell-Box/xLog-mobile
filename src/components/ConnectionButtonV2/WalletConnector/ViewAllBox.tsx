import * as React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { DarkTheme, LightTheme } from "@/constants/colors";

import ViewAllIcon from "../../../assets/ViewAll.png";

interface Props {
  onPress: any
}

function ViewAllBox({ onPress }: Props) {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image style={styles.icon} source={ViewAllIcon} />
      <View>
        <Text
          style={[styles.text, isDarkMode && styles.textDark]}
          numberOfLines={1}>
          View All
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    height: 60,
    width: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LightTheme.overlayThin,
  },
  container: {
    width: "25%",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  text: {
    color: LightTheme.foreground1,
    marginVertical: 8,
    maxWidth: 100,
    fontWeight: "600",
    fontSize: 12,
  },
  textDark: {
    color: DarkTheme.foreground1,
  },
});

export default ViewAllBox;
