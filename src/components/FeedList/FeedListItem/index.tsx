import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import type { ViewStyle } from "react-native";
import { Image as RNImage, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Eye } from "@tamagui/lucide-icons";
import type { NoteEntity } from "crossbell";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import sizeOf from "image-size";
import { SizableText, Stack, Text, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Center } from "@/components/Base/Center";
import { bgLength, bgsReversed } from "@/constants/bgs";
import { isIOS } from "@/constants/platform";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useRootNavigation } from "@/hooks/use-navigation";
import { cacheStorage } from "@/utils/cache-storage";
import { getCompressedImageUrl, withCompressedImage } from "@/utils/get-compressed-image-url";

export interface Props {
  note: NoteEntity
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
  const navigation = useRootNavigation();
  const originalCoverImage = useCoverImage(note);
  const coverImage = useMemo(() => withCompressedImage(originalCoverImage), [originalCoverImage]);
  const usingDefaultCoverImage = !coverImage;
  const defaultLayout = { width, height: defaultCoverImageHeight };
  const [sourceLayout, setSourceLayout] = React.useState<{ width: number;height: number } | undefined>(
    usingDefaultCoverImage ? defaultLayout : undefined,
  );

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
    const cachedLayout = await cacheStorage.getString(`img-layouts:${coverImage}`);

    if (cachedLayout) {
      return {
        origin: "cache",
        ...JSON.parse(cachedLayout),
      };
    }

    if (!coverImage) {
      return defaultLayout;
    }

    return new Promise((resolve) => {
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
    if (usingDefaultCoverImage) {
      return;
    }

    getCoverSourceLayout().then((layout) => {
      setSourceLayout(layout);
      if (layout.origin !== "cache") {
        cacheStorage.set(`img-layouts:${coverImage}`, JSON.stringify(layout));
      }
    });
  }, [coverImage]);

  const titleContent = note?.metadata?.content?.title || note?.metadata?.content?.content;
  const titleElement = (
    titleContent && (
      <SizableText
        size={"$5"}
        fontWeight={"700"}
        color="$color"
        marginBottom={"$2"}
        numberOfLines={2}
      >
        {String(titleContent)}
      </SizableText>
    )
  );

  if (!sourceLayout) {
    return null;
  }

  return (
    <Animated.View
      style={[props.style, styles.container]}
      entering={FadeInDown.duration(150)}
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
                <BlurView tint="light" intensity={10} style={{ position: "absolute", width: "100%", height: "100%" }} />
                <SizableText
                  size={"$5"}
                  fontWeight={"700"}
                  color="white"
                  marginBottom={"$2"}
                  marginHorizontal={"$2"}
                  numberOfLines={2}
                >
                  {title}
                </SizableText>
              </Center>
            )
        }
        <Stack
          backgroundColor={"$cardBackground"}
          borderBottomLeftRadius={10}
          borderBottomRightRadius={10}
          paddingHorizontal={4}
          paddingVertical={8}
        >
          {titleElement}
          <XStack alignItems="center" justifyContent="space-between" gap={"$2"} marginBottom={"$1"}>
            <XStack alignItems="center" gap="$2" flex={1}>
              <Avatar character={note?.character} useDefault size={20}/>
              <XStack alignItems="center" flex={1}>
                <Text numberOfLines={1} fontSize={14} color={"#8F8F91"}>
                  {note?.character?.metadata?.content?.name || note?.character?.handle}
                </Text>
              </XStack>
            </XStack>
            <XStack alignItems="center" gap={6}>
              <Eye size={20} color={"#8F8F91"}/>
              <XStack alignItems="center">
                <SizableText size="$3" color={"#8F8F91"}>
                  {note?.stat?.viewDetailCount || 0}
                </SizableText>
              </XStack>
            </XStack>
          </XStack>
        </Stack>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    marginBottom: 8,
  },
});
