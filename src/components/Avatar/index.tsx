import type { FC } from "react";
import { StyleSheet } from "react-native";

import type { CharacterEntity } from "crossbell";
import { Image } from "expo-image";
import { Circle, Text, Avatar as _Avatar } from "tamagui";

import { toGateway } from "@/utils/ipfs-parser";

import { LogoResource } from "../Logo";

interface Props {
  character: CharacterEntity
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
  const { character, size = 45, useDefault = false } = props;
  const uri = character?.metadata?.content?.avatars?.[0];
  const name = character?.metadata?.content?.name;

  if (!uri || (!uri.startsWith("/assets/") && !isValidUrl(uri))) {
    if (useDefault) {
      return (
        <Circle
          size={size}
          bordered
          circular
          backgroundColor="$background"
        >
          <Text textAlign="center" fontSize={size / 2} fontWeight={"700"}>
            {
              name?.split(" ")?.length > 1 ? name?.split(" ")?.map(n => n?.[0]?.toUpperCase())?.join("") : `${name?.[0]?.toUpperCase()}${name?.[1]}`
            }
          </Text>
        </Circle>
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
