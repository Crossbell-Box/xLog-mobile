import type { FC } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "@/navigation/types";

export interface Props {
  url: string
}

export const WebPage: FC<NativeStackScreenProps<RootStackParamList, "Web">> = (props) => {
  const { url } = props.route.params;

  return (
    <WebView
      style={styles.container}
      source={{ uri: url }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
