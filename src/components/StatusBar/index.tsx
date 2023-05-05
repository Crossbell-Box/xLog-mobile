import React from "react";

import { StatusBar as ExpoStatusBar } from "expo-status-bar";

import { useColors } from "@/hooks/use-color";
import { useThemeStore } from "@/hooks/use-theme-store";

export interface StatusBarProps {

}

export const StatusBar: React.FC<StatusBarProps> = () => {
  const { isDarkMode } = useThemeStore();
  const { background } = useColors();
  return <ExpoStatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={background} />;
};
