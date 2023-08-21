import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Image as RNImage } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { SizableText, Stack, Text, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Center } from "@/components/Base/Center";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { ExpandedNote } from "@/types/crossbell";
import { toGateway } from "@/utils/ipfs-parser";
import { syncStorage } from "@/utils/storage";

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

const defaultCoverImageHeight = minHeight;

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
    const height = sourceLayout ? (width * sourceLayout.height) / sourceLayout.width : defaultCoverImageHeight;

    return {
      width,
      height,
    };
  }, [width, sourceLayout]);

  const title = String(note?.metadata?.content?.title);
  const placeholderBg = bgs[title?.length % bgs.length || 0];

  const getCoverSourceLayout = async (): Promise<{
    width: number
    height: number
  }> => {
    const cachedLayout = await syncStorage.getString(`img-layouts:${coverImage}`);

    if (cachedLayout) {
      return JSON.parse(cachedLayout);
    }

    const defaultLayout = {
      width,
      height: defaultCoverImageHeight,
    };
    if (!coverImage) {
      return defaultLayout;
    }
    return await new Promise ((resolve) => {
      RNImage.getSize(
        coverImage,
        (_, height) => {
          resolve({
            width,
            height,
          });
        },
        () => {
          resolve(defaultLayout);
        },
      );
    });
  };

  useEffect(() => {
    coverImage && Image.prefetch(coverImage);
    getCoverSourceLayout().then((layout) => {
      syncStorage.set(`img-layouts:${coverImage}`, JSON.stringify(layout));
      setSourceLayout(layout);
    });
  }, [coverImage]);

  if (!sourceLayout) {
    return null;
  }

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
                  source={coverImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  responsivePolicy="initial"
                  style={{ width: "100%", height: "100%" }}
                  placeholder={placeholderBg}
                  recyclingKey={coverImage}
                  placeholderContentFit="cover"
                />
              </Stack>
            )
            : (
              <Center height={150} width={"100%"} backgroundColor={"black"}>
                <Image
                  source={placeholderBg}
                  style={{ height: "100%", width: "100%", position: "absolute" }}
                  contentFit="cover"
                />
                <BlurView tint="dark" intensity={10} style={{ position: "absolute", width: "100%", height: "100%" }} />
                <SizableText
                  size={"$5"}
                  fontWeight={"700"}
                  color="$color"
                  marginBottom={"$2"}
                  marginHorizontal={"$2"}
                  numberOfLines={2}
                >
                  {title}
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
