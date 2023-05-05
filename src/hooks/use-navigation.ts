import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";

import type { HomeBottomTabsParamList, RootStackParamList } from "@/navigation/types";

export const useRootNavigation = () => (
  useNavigation<StackNavigationProp<RootStackParamList>>()
);

export const useHomeNavigation = () => (
  useNavigation<StackNavigationProp<HomeBottomTabsParamList>>()
);
