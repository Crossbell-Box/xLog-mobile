import { Fragment, type FC } from "react";
import { Dimensions, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import { HeaderHeightContext } from "@react-navigation/elements";
import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import type { NoteEntity } from "crossbell";
import { Image } from "expo-image";
import moment from "moment";
import { SizableText, Spacer, Stack, Text, Theme, View, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { CarouselPagination } from "@/components/CarouselPagination";
import { bgs } from "@/constants/bgs";
import { useCoverImage } from "@/hooks/use-cover-image";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useGetPage } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";
import { withCompressedImage } from "@/utils/get-compressed-image-url";
import { getNoteSlug } from "@/utils/get-slug";
import { toGateway } from "@/utils/ipfs-parser";
import { isShortNotes } from "@/utils/is-short-notes";

interface Props {
  isCapturing: boolean
  headerContainerHeight: number
  postUri?: string
  note: NoteEntity
  characterId: number
  placeholderCoverImageIndex: number
  coverImage: string
}

const { width, height } = Dimensions.get("window");

export const Header: FC<Props> = (props) => {
  const { note, characterId, coverImage: _coverImage, placeholderCoverImageIndex = 0, postUri, isCapturing, headerContainerHeight } = props;
  const character = useCharacter(characterId);
  const defaultCoverImage = bgs[placeholderCoverImageIndex];
  const coverImage = _coverImage ?? defaultCoverImage;
  const isShort = isShortNotes(note);
  const progressValue = useSharedValue<number>(0);
  const { isDarkMode } = useThemeStore();
  const { top } = useSafeAreaInsets();
  // const qrCodeComponent = postUri && (
  //   <Stack
  //     backgroundColor={"$color"}
  //     padding={"$2"}
  //     borderRadius={"$2"}
  //     overflow="hidden"
  //     position="absolute"
  //     right={0}
  //     top={0}
  //   >
  //     <QRCode size={70} value={postUri} logoSize={30} logoBackgroundColor="transparent"/>
  //   </Stack>
  // );

  const noteTitle = note?.metadata?.content?.title;
  const headerImageHeight = isShort ? Math.max(height * 0.6, 500) : 300;
  const data = isShort
    ? note?.metadata?.content?.attachments?.map(attachment => withCompressedImage(toGateway(attachment.address), "high"))
    : [coverImage].map(attachment => withCompressedImage(attachment, "high"));

  const userinfoEle = (
    <Stack minHeight={28}>
      {
        character?.data && (
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
    </Stack>)
    ;

  return (
    <YStack backgroundColor={isDarkMode ? "black" : "white"} marginBottom={isShort ? 0 : 50} paddingTop={isShort ? top : 0}>
      <Carousel
        data={data}
        loop={false}
        enabled={data.length > 1}
        onProgressChange={(_, absoluteProgress) =>
          (progressValue.value = absoluteProgress)
        }
        renderItem={({ item }) => (
          <CoverItem
            src={item}
            isShort={isShort}
            displayDarkMask={!isShort}
            headerImageHeight={headerImageHeight}
          />
        )}
        width={width}
        height={headerImageHeight}
      />

      {
        isShort
          ? (
            <YStack paddingHorizontal="$2" paddingTop="$2">
              {
                data.length > 1 && (
                  <Stack alignItems="center" paddingVertical="$3">
                    <CarouselPagination
                      progressValue={progressValue}
                      count={data.length}
                      dotSize={6}
                    />
                  </Stack>
                )
              }
              {userinfoEle}
              <Spacer size="$3"/>
              {
                noteTitle && (
                  <>
                    <Text fontSize={20} fontWeight={"700"} numberOfLines={2} color="$color">{noteTitle}</Text>
                    <Spacer size="$3"/>
                  </>
                )
              }
            </YStack>
          )
          : (
            <YStack gap="$4" position="absolute" bottom={-40} paddingHorizontal="$2">
              <Text fontSize={24} fontWeight={"700"} numberOfLines={2} color="white">{noteTitle}</Text>
              {userinfoEle}
            </YStack>
          )
      }
    </YStack>
  );
};

const CoverItem: FC<{
  src: string
  headerImageHeight: number
  displayDarkMask: boolean
  isShort: boolean
}> = ({
  src,
  headerImageHeight,
  displayDarkMask,
  isShort,
}) => {
  return (
    <Stack>
      <Image
        source={src}
        contentFit={isShort ? "contain" : "cover"}
        cachePolicy="disk"
        responsivePolicy="initial"
        style={{ width, height: headerImageHeight }}
      />
      {displayDarkMask && (
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
      )}
    </Stack>
  );
};
