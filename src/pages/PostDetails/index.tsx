import type { FC } from "react";
import React, { useEffect } from "react";
import { useSharedValue, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import type { RootStackParamList } from "@/navigation/types";

import { BottomBar } from "./BottomBar";
import { Content } from "./Content";
import { Header } from "./Header";

export interface Props {
  noteId: number
  characterId: number
}

export const PostDetailsPage: FC<NativeStackScreenProps<RootStackParamList, "PostDetails">> = (props) => {
  const { route, navigation } = props;
  const { params } = route;
  // eslint-disable-next-line no-console
  console.log(params, "params");
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);

  const { bottom } = useSafeAreaInsets();
  const bottomBarHeight = bottom + 45;
  const headerContainerHeight = 45;

  const followAnimValue = useSharedValue<number>(0);
  const scrollVisibilityHandler = useScrollVisibilityHandler({ scrollThreshold: 30 });

  const closeModal = React.useCallback(() => {
    setDisplayImageUris([]);
  }, []);

  useEffect(() => {
    followAnimValue.value = withDelay(1500, withSpring(1));
  }, []);

  return (
    <>
      <Stack flex={1} backgroundColor={"$background"}>
        <Header
          isExpandedAnimValue={scrollVisibilityHandler.isExpandedAnimValue}
          characterId={params.characterId}
          noteId={params.noteId}
          headerContainerHeight={headerContainerHeight}
        />
        <Content
          characterId={params.characterId}
          noteId={params.noteId}
          navigation={navigation}
          scrollEventHandler={scrollVisibilityHandler}
          bottomBarHeight={bottomBarHeight}
          headerContainerHeight={headerContainerHeight}
        />
        <BottomBar
          characterId={params.characterId}
          noteId={params.noteId}
          bottomBarHeight={bottomBarHeight}
        />
      </Stack>

      <ImageGallery
        isVisible={displayImageUris.length > 0}
        uris={displayImageUris}
        onClose={closeModal}
      />
    </>
  );
};
