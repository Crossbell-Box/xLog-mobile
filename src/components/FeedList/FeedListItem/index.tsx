import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Image as RNImage } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { SizableText, Stack, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Center } from "@/components/Base/Center";
import { bgLength, bgsReversed } from "@/constants/bgs";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { ExpandedNote } from "@/types/crossbell";
export interface Props {
  note: ExpandedNote
  style?: ViewStyle
  searchKeyword?: string
  width: number
}

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

  const coverImage = useCoverImage(note);
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
  const placeholderBgIndex = title?.length % bgLength || 0;
  const placeholderBg = bgsReversed[placeholderBgIndex];

  const onPress = React.useCallback(() => {
    navigation.navigate(
      "PostDetails",
      {
        characterId: note.characterId,
        placeholderCoverImageIndex: placeholderBgIndex,
        coverImage,
        note,
      },
    );
  }, [note]);

  const getCoverSourceLayout = async (): Promise<{
    origin?: string
    width: number
    height: number
  }> => {
    const cachedLayout = await AsyncStorage.getItem(`img-layouts:${coverImage}`);

    if (cachedLayout) {
      return {
        origin: "cache",
        ...JSON.parse(cachedLayout),
      };
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
    getCoverSourceLayout().then(async (layout) => {
      if (layout.origin !== "cache") {
        await AsyncStorage.setItem(`img-layouts:${coverImage}`, JSON.stringify(layout));
      }
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
                backgroundColor={"black"}
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
