import type { FC } from "react";
import { StyleSheet } from "react-native";

import { Image } from "expo-image";
import { Avatar as _Avatar } from "tamagui";

import { toGateway } from "@/utils/ipfs-parser";

import { LogoResource } from "../Logo";

interface Props {
  uri?: string
  size?: number
  useDefault?: boolean
}

const isValidUrl = (url) => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return true;
  }
  catch (error) {
    return false;
  }
};

export const Avatar: FC<Props> = (props) => {
  const { uri, size = 45, useDefault = false } = props;

  if (!uri || (!uri.startsWith("/assets/") && !isValidUrl(uri))) {
    if (useDefault) {
      return (
        <_Avatar
          size={size}
          bordered
          circular
          backgroundColor="white"
        >
          <_Avatar.Image src={LogoResource} />
        </_Avatar>
      );
    }

    return null;
  }

  return (
    <_Avatar
      size={size}
      bordered
      circular
      backgroundColor="white"
    >
      <_Avatar.Image src={toGateway(uri)} />
      <_Avatar.Fallback>
        <Image source={LogoResource} contentFit={"cover"} style={styles.container} />
      </_Avatar.Fallback>
    </_Avatar>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    transform: [
      { scale: 0.8 },
    ],
  },
});
