import type { FC } from "react";
import { StyleSheet } from "react-native";

import { Image } from "expo-image";
import { Avatar as _Avatar } from "tamagui";

import { toGateway } from "@/utils/ipfs-parser";

import { LogoResource } from "../Logo";

interface Props {
  uri?: string
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
  const { uri } = props;
  const size = 45;

  if (!uri) return null;

  if (!uri.startsWith("/assets/") && !isValidUrl(uri))
    return null;

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
