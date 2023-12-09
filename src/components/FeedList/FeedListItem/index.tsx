import type { FC } from "react";
import React, { useMemo } from "react";
import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeInDown } from "react-native-reanimated";

import { Eye } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { SizableText, Stack, Text, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { Center } from "@/components/Base/Center";
import { bgsReversed } from "@/constants/bgs";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useImageSize } from "@/hooks/use-image-size";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { ExpandedNote } from "@/types/crossbell";
import { computedBgIdx } from "@/utils/computed-bg-idx";

export interface Props {
  note: ExpandedNote
  style?: ViewStyle
  searchKeyword?: string
  width: number
}

const minHeight = 150;
const defaultCoverImageHeight = minHeight;

export const FeedListItem: FC<Props> = (props) => {
  const { note, width } = props;
  const navigation = useRootNavigation();
  const { optimizedImage, originalImage } = useCoverImage(note);
  const title = String(note?.metadata?.content?.title);
  const placeholderBgIndex = computedBgIdx(note);
  const placeholderBg = bgsReversed[placeholderBgIndex];
  const dimensionsMap = note?.metadata?.content?.imageDimensions;

  const coverImageSize = useImageSize(
    originalImage,
    width,
    defaultCoverImageHeight,
    dimensionsMap,
  );

  const relativeHeight = useMemo(() => {
    const ratio = coverImageSize.width / coverImageSize.height;
    const _height = Math.max(width / ratio, minHeight);
    return isNaN(_height) ? defaultCoverImageHeight : _height;
  }, [coverImageSize.height]);

  const onPress = React.useCallback(() => {
    navigation.navigate(
      "PostDetails",
      {
        characterId: note.characterId,
        placeholderCoverImageIndex: placeholderBgIndex,
        coverImage: optimizedImage,
        note,
      },
    );
  }, [note]);

  const titleContent = note?.metadata?.content?.title || note?.metadata?.content?.content;
  const titleElement = (
    titleContent
      && (
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

  if (!coverImageSize) {
    return null;
  }

  return (
    <Animated.View
      style={[props.style, styles.container]}
      entering={FadeInDown.duration(150)}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        {
          optimizedImage
            ? (
              <Stack
                width={width}
                height={relativeHeight}
                backgroundColor={"black"}
                opacity={1}
                animation="lazy"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
              >
                <Image
                  source={optimizedImage}
                  contentFit="cover"
                  cachePolicy="disk"
                  responsivePolicy="initial"
                  style={{ width: "100%", height: "100%" }}
                  placeholder={placeholderBg}
                  recyclingKey={optimizedImage}
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
          <XStack alignItems="center" justifyContent="space-between" gap={"$2"} marginVertical={"$1"}>
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
