import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { YStack } from "tamagui";

import { PolarLightBackground } from "./PolarLightBackground";

export interface ProfilePageLayoutProps extends React.ComponentProps<typeof YStack> {

}

export const ProfilePageLayout: React.FC<ProfilePageLayoutProps> = (props) => {
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <PolarLightBackground activeIndex={0}/>
      <YStack flex={1} {...props} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
