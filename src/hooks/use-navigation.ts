import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import type { HomeBottomTabsParamList, RootStackParamList, SettingsStackParamList } from "@/navigation/types";

export const useRootNavigation = () => (
  useNavigation<StackNavigationProp<RootStackParamList>>()
);

export const useHomeNavigation = () => (
  useNavigation<StackNavigationProp<HomeBottomTabsParamList>>()
);

export const useSettingsNavigation = () => (
  useNavigation<StackNavigationProp<SettingsStackParamList>>()
);
