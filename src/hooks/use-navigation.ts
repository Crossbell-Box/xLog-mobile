import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { HomeBottomTabsParamList, RootStackParamList, SettingsStackParamList } from "@/navigation/types";

export const useRootNavigation = () => (
  useNavigation<NativeStackNavigationProp<RootStackParamList>>()
);

export const useHomeNavigation = () => (
  useNavigation<NativeStackNavigationProp<HomeBottomTabsParamList>>()
);

export const useSettingsNavigation = () => (
  useNavigation<NativeStackNavigationProp<SettingsStackParamList>>()
);
