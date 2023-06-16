import type { FC } from "react";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useSharedValue, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack, Text, YStack, useTheme } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";
import { Header as UserInfoHeader } from "@/pages/UserInfo/Header";

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
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);
  const { isDarkMode } = useThemeStore();
  const { bottom, top } = useSafeAreaInsets();
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
          headerComponent={(
            <YStack paddingBottom="$4" borderBottomColor={"$color7"} borderBottomWidth={StyleSheet.hairlineWidth} paddingHorizontal={20} paddingTop={headerContainerHeight + top} backgroundColor={isDarkMode ? "black" : "white"}>
              <UserInfoHeader characterId={params.characterId}/>
            </YStack>
          )}
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
