import type { FC } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import type { CharacterEntity } from "crossbell";
import { Image } from "expo-image";
import { Circle, Text, Avatar as _Avatar } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import { toGateway } from "@/utils/ipfs-parser";

import { LogoResource } from "../Logo";
import { TouchWithHaptics } from "../TouchWithHaptics";

interface Props {
  character: CharacterEntity
  size?: number
  useDefault?: boolean
  isNavigateToUserInfo?: boolean
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
  const { character, size = 45, useDefault = false, isNavigateToUserInfo = true } = props;
  const navigation = useRootNavigation();
  const uri = character?.metadata?.content?.avatars?.[0];
  const name = character?.metadata?.content?.name;
  const nameAbbr = (name || "")
    .split(" ")
    .slice(0, 2)
    .map(word => word[0])
    .join("");

  const navigateToUserInfo = () => {
    if (!character?.characterId) {
      return;
    }
    navigation.navigate("UserInfo", { characterId: character?.characterId });
  };

  if (!uri || (!uri.startsWith("/assets/") && !isValidUrl(uri))) {
    if (useDefault) {
      return (
        <TouchableOpacity disabled={!isNavigateToUserInfo} onPress={navigateToUserInfo}>
          <Circle
            size={size}
            bordered
            circular
            backgroundColor="$background"
          >
            <Text textAlign="center" fontSize={size / 2} fontWeight={"700"}>
              {nameAbbr}
            </Text>
          </Circle>
        </TouchableOpacity>
      );
    }

    return null;
  }

  return (
    <TouchWithHaptics disabled={!isNavigateToUserInfo} touchableComponent={TouchableOpacity} onPress={navigateToUserInfo}>
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
    </TouchWithHaptics>
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
