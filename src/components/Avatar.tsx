import type { FC } from "react";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import type { CharacterEntity } from "crossbell";
import { Image } from "expo-image";
import { Circle, Text, Avatar as _Avatar } from "tamagui";

import { useNavigateToUserInfo } from "@/hooks/use-navigate-to-user-info";
import { useThemeStore } from "@/hooks/use-theme-store";
import { withCompressedImage } from "@/utils/get-compressed-image-url";
import { toGateway } from "@/utils/ipfs-parser";

import { LogoLightBlueResource, LogoDarkBlueResource } from "./Logo";
import { XTouch } from "./XTouch";

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
  const { navigateToUserInfo } = useNavigateToUserInfo(character);
  const { isDarkMode } = useThemeStore();
  const LogoResource = isDarkMode ? LogoLightBlueResource : LogoDarkBlueResource;
  const uri = character?.metadata?.content?.avatars?.[0];

  if (!uri || (!uri.startsWith("/assets/") && !isValidUrl(uri))) {
    const name = character?.metadata?.content?.name;
    const nameAbbr = (name || "")
      .split(" ")
      .slice(0, 2)
      .map(word => word[0])
      .join("");
    let avatar: React.ReactNode = null;

    if (useDefault && nameAbbr) {
      avatar = (
        <Circle
          size={size}
          circular
        >
          <Text textAlign="center" fontSize={size / 2} fontWeight={"700"}>
            {nameAbbr}
          </Text>
        </Circle>
      );
    }
    else {
      avatar = (
        <Circle
          size={size}
          circular
          alignItems="center"
          justifyContent="center"
        >
          <Image
            source={LogoResource}
            contentFit={"contain"}
            style={{ height: "75%", width: "75%" }}
            cachePolicy="disk"
          />
        </Circle>
      );
    }

    return (
      <TouchableOpacity disabled={!isNavigateToUserInfo} onPress={navigateToUserInfo}>
        {avatar}
      </TouchableOpacity>
    );
  }

  return (
    <XTouch enableHaptics disabled={!isNavigateToUserInfo} touchableComponent={TouchableOpacity} onPress={navigateToUserInfo}>
      <Image
        source={{ uri: withCompressedImage(toGateway(uri), "low") }}
        contentFit={"cover"}
        style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}
        cachePolicy="disk"
      />
    </XTouch>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    transform: [
      { scale: 0.8 },
    ],
  },
});
