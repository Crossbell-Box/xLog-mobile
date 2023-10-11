import { useMemo, type FC } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Carousel from "react-native-reanimated-carousel";

import { ChevronRight } from "@tamagui/lucide-icons";
import type { NoteEntity } from "crossbell";
import { BlurView } from "expo-blur";
import { Image, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { LogoDarkBlueResource, LogoLightBlueResource } from "@/components/Logo";
import { XTouch } from "@/components/XTouch";
import { useCharacterId } from "@/hooks/use-character-id";
import { useHomeNavigation, useRootNavigation } from "@/hooks/use-navigation";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useGetFeed } from "@/queries/home";
import type { GetFeedParams } from "@/queries/home";
import { computedBgIdx } from "@/utils/computed-bg-idx";
import { withCompressedImage } from "@/utils/get-compressed-image-url";
import { toGateway } from "@/utils/ipfs-parser";

interface Props { }

const { width } = Dimensions.get("window");

export const ShortsExplorerBanner: FC<Props> = () => {
  const characterId = useCharacterId();
  const params = useMemo<GetFeedParams | null>(() => {
    return {
      characterId,
      daysInterval: 7,
      limit: 6,
      searchKeyword: undefined,
      searchType: "latest",
      sourceType: "short",
      tags: [],
    };
  }, [characterId]);
  const shorts = useGetFeed(params);
  const { isDarkMode } = useThemeStore();
  const navigation = useRootNavigation();

  return (
    <YStack paddingTop="$2" >
      <XStack alignItems="center" justifyContent="space-between" paddingHorizontal="$2">
        <XStack alignItems="center" gap="$2">
          <Image source={
            isDarkMode
              ? LogoLightBlueResource
              : LogoDarkBlueResource
          } width={18} height={18}/>
          <Text fontWeight={"600"} fontSize={"$7"}>Shorts</Text>
        </XStack>

        <XTouch hitSlopSize={44} onPress={() => {
          navigation.navigate("Home", { screen: "Shorts" });
        }}>
          <ChevronRight/>
        </XTouch>
      </XStack>
      <Carousel
        data={shorts.data?.pages?.flatMap(page => page?.list) || []}
        renderItem={({ item }) => <CarouselItem note={item} key={item.blockNumber}/>}
        mode="parallax"
        width={width - 8}
        height={200}
        panGestureHandlerProps={{ activeOffsetX: [-10, 10] }}
        vertical={false}
      />
    </YStack>
  );
};

const CarouselItem: FC<{ note: NoteEntity }> = ({ note }) => {
  const navigation = useRootNavigation();
  const cover = note?.metadata?.content?.attachments?.find(({ address }) => !!address)?.address;
  const convertedCover = withCompressedImage(toGateway(cover));

  return (
    <TouchableWithoutFeedback
      containerStyle={styles.commonContainer}
      style={styles.commonContainer}
      onPress={() => {
        navigation.navigate("PostDetails", {
          characterId: note.character?.characterId,
          note,
          coverImage: convertedCover,
          placeholderCoverImageIndex: computedBgIdx(note),
        });
      }}
    >
      <YStack
        flex={1}
        justifyContent="flex-end"
        borderRadius={10}
        overflow="hidden"
      >
        <Image
          source={{ uri: convertedCover }}
          flex={1}
          {...StyleSheet.absoluteFillObject}
        />
        <XStack padding="$2" alignItems="center" justifyContent="space-between">
          <BlurView tint="default" {...StyleSheet.absoluteFillObject}/>
          <Text fontSize={"$7"} numberOfLines={1} fontWeight={"500"} flex={1}>
            {note?.metadata?.content?.title || note?.metadata?.content?.content}
          </Text>
          <Avatar size={28} character={note?.character}/>
        </XStack>
      </YStack>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  maskContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    overflow: "hidden",
  },
  commonContainer: {
    flex: 1,
  },
});

