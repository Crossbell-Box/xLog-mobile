import React from "react";
import {
  Image,
  StyleSheet,
  View,
  useColorScheme,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import { XTouch } from "@/components/XTouch";
import { DarkTheme, LightTheme } from "@/constants/colors";

import Close from "../../../assets/Close.png";
import CloseWhite from "../../../assets/CloseWhite.png";
import WCLogo from "../../../assets/WCLogo.png";

interface ExplorerModalHeaderProps {
  close: () => void
}

function ExplorerModalHeader({ close }: ExplorerModalHeaderProps) {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <View style={styles.container}>
      <Image style={styles.wcLogo} source={WCLogo} />
      <XTouch
        touchableComponent={TouchableOpacity}
        style={[styles.closeContainer, isDarkMode && styles.closeContainerDark]}
        onPress={close}
        hitSlopSize={44}
      >
        <Image
          style={styles.closeImage}
          source={isDarkMode ? CloseWhite : Close}
        />
      </XTouch>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  wcLogo: {
    width: 181,
    height: 28,
  },
  closeImage: {
    width: 12,
    height: 12,
  },
  closeContainer: {
    height: 28,
    width: 28,
    backgroundColor: LightTheme.background1,
    borderRadius: 14,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  closeContainerDark: {
    backgroundColor: DarkTheme.background1,
  },
});

export default ExplorerModalHeader;
