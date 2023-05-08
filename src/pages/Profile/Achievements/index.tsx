import type { FC } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text } from "tamagui";

import type { RootStackParamList } from "@/navigation/types";

export interface Props {
}

export const AchievementsPage: FC<NativeStackScreenProps<RootStackParamList, "Achievements">> = (props) => {
  return (
    <SafeAreaView>
      <Text>111</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});
