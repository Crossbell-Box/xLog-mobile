import { Fragment, type FC } from "react";
import { Dimensions } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import { HeaderHeightContext } from "@react-navigation/elements";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { Image } from "expo-image";
import moment from "moment";
import { SizableText, Stack, Text, Theme, View, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { bgs } from "@/constants/bgs";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useGetPage } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";
import { getNoteSlug } from "@/utils/get-slug";

interface Props {
  isCapturing: boolean
  headerContainerHeight: number
  postUri?: string
  note: ExpandedNote
  characterId: number
  placeholderCoverImageIndex: number
  coverImage: string
}

const { width } = Dimensions.get("window");

export const Header: FC<Props> = (props) => {
  const { note, characterId, coverImage, placeholderCoverImageIndex = 0, postUri, isCapturing, headerContainerHeight } = props;
  const page = useGetPage(
    {
      characterId,
      slug: getNoteSlug(note),
      useStat: true,
    },
  );
  const character = useCharacter(characterId);
  const defaultCoverImage = bgs[placeholderCoverImageIndex];

  const { bottom, top } = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const qrCodeComponent = postUri && (
    <Stack
      backgroundColor={"$color"}
      padding={"$2"}
      borderRadius={"$2"}
      overflow="hidden"
      position="absolute"
      right={0}
      top={0}
    >
      <QRCode size={70} value={postUri} logoSize={30} logoBackgroundColor="transparent"/>
    </Stack>
  );

  const noteTitle = note?.metadata?.content?.title;

  const headerImageHeight = 300;

  return (
    <YStack backgroundColor={isDarkMode ? "black" : "white"} marginBottom={50}>
      <Image
        source={coverImage ?? defaultCoverImage}
        contentFit="cover"
        cachePolicy="disk"
        responsivePolicy="initial"
        style={{ width, height: headerImageHeight }}
        placeholder={defaultCoverImage}
        recyclingKey={coverImage}
        placeholderContentFit="cover"
      />
      <Stack position="absolute" width={width} height={headerImageHeight + 5} top={0}>
        <Canvas style={{ flex: 1 }}>
          <Rect x={0} y={0} width={width} height={headerImageHeight + 5}>
            <LinearGradient
              start={vec(width / 2, headerImageHeight)}
              end={vec(width / 2, 0)}
              colors={["rgba(0,0,0,1)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
            />
          </Rect>
        </Canvas>
      </Stack>

      <YStack gap="$4" position="absolute" bottom={-40} paddingHorizontal="$2">
        <Text fontSize={24} fontWeight={"700"} numberOfLines={2} color="white">
          {noteTitle}
        </Text>

        <Stack minHeight={28}>
          {
            character?.data
            && (
              <XStack alignItems="center" gap={"$2"} marginBottom={"$1"}>
                <Avatar character={character.data} useDefault size={26}/>
                <XStack alignItems="center" gap="$4">
                  <SizableText size="$3" color={"$color"}>
                    {character.data?.metadata?.content?.name || character.data?.handle}
                  </SizableText>
                  <SizableText size="$3" color={"#929190"}>
                    {moment(note?.createdAt).format("YYYY-MM-DD")}
                  </SizableText>
                </XStack>
              </XStack>
            )
          }
        </Stack>
      </YStack>
    </YStack>
  );
};
