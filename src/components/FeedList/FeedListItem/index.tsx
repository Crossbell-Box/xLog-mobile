import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Image as RNImage } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { SizableText, Stack, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Center } from "@/components/Base/Center";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { ExpandedNote } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";

export interface Props {
  note: ExpandedNote
  style?: ViewStyle
  searchKeyword?: string
  width: number
}

const bgs = [
  require("../../../assets/home-grid-bg/0-reversed.png"),
  require("../../../assets/home-grid-bg/1-reversed.png"),
  require("../../../assets/home-grid-bg/2-reversed.png"),
  require("../../../assets/home-grid-bg/3-reversed.png"),
  require("../../../assets/home-grid-bg/4-reversed.png"),
  require("../../../assets/home-grid-bg/5-reversed.png"),
];

const minHeight = 150;
const maxHeight = 200;

const getCoverRangedSize = (height: number) => {
  return Math.max(Math.min(height, maxHeight), minHeight);
};

export const FeedListItem: FC<Props> = (props) => {
  const { note, width } = props;
  const layoutRef = useRef<Animated.View>(null);
  const navigation = useRootNavigation();

  const onPress = React.useCallback(() => {
    navigation.navigate(
      "PostDetails",
      {
        characterId: note.characterId,
        noteId: note.noteId,
      },
    );
  }, [note]);

  const coverImage = useMemo(() => toGateway(note.metadata?.content?.images?.[0]), [note?.metadata?.content?.images]);
  const [sourceLayout, setSourceLayout] = React.useState<{
    width: number
    height: number
  } | undefined>(undefined);

  const coverImageAnimStyles = useMemo(() => {
    const height = sourceLayout ? (width * sourceLayout.height) / sourceLayout.width : 150;

    return {
      width,
      height,
    };
  }, [width, sourceLayout]);

  return (
    <Animated.View
      ref={layoutRef}
      style={[props.style, { paddingHorizontal: 4, marginBottom: 8 }]}
      entering={FadeIn.duration(150)}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        {
          coverImage
            ? (
              <Stack
                width={coverImageAnimStyles.width}
                height={getCoverRangedSize(coverImageAnimStyles.height)}
              >
                <Image
                  onLoad={(e) => {
                    const { width, height } = e.source;
                    setSourceLayout({ width, height });
                  }}
                  source={coverImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  style={{ width: "100%", height: "100%" }}
                />
              </Stack>
            )
            : (
              <Center height={150} width={"100%"} backgroundColor={"black"}>
                <Image
                  source={bgs[Math.floor(Math.random() * bgs.length)]}
                  style={{ height: "100%", width: "100%", position: "absolute" }}
                  contentFit="cover"
                />
                <SizableText
                  size={"$5"}
                  fontWeight={"700"}
                  color="$color"
                  marginBottom={"$2"}
                  marginHorizontal={"$2"}
                  numberOfLines={2}
                >
                  {String(note?.metadata?.content?.title)}
                </SizableText>
              </Center>
            )
        }
        <Stack backgroundColor={"#1A1920"} borderBottomLeftRadius={10} borderBottomRightRadius={10} paddingHorizontal={4} paddingVertical={8}>
          {
            note?.metadata?.content?.title && (
              <SizableText
                size={"$5"}
                fontWeight={"700"}
                color="$color"
                marginBottom={"$2"}
                numberOfLines={2}
              >
                {String(note?.metadata?.content?.title)}
              </SizableText>
            )
          }
          <XStack alignItems="center" gap={"$2"} marginBottom={"$1"}>
            <Avatar character={note?.character} useDefault size={20}/>
            <XStack alignItems="center">
              <SizableText size="$3" color={"#8F8F91"}>{note?.character?.metadata?.content?.name || note?.character?.handle}</SizableText>
            </XStack>
          </XStack>
        </Stack>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};
