import { StyleSheet } from "react-native";

import { YGroup, Stack, styled } from "tamagui";

export const SettingsYGroup = styled(YGroup, {
  separator: <Stack backgroundColor={"$groupBackground"} alignItems="center">
    <Stack backgroundColor={"#92919060"} height={StyleSheet.hairlineWidth} width={"90%"}/>
  </Stack>,
});
