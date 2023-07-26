import type { FC } from "react";
import React, { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
import { useSharedValue, withSpring, withDelay } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Stack, YStack, Separator } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { usePostWebViewLink } from "@/hooks/use-post-link";
import { useScrollVisibilityHandler } from "@/hooks/use-scroll-visibility-handler";
import { useThemeStore } from "@/hooks/use-theme-store";
import type { RootStackParamList } from "@/navigation/types";
import { Header as UserInfoHeader } from "@/pages/UserInfo/Header";
import { GA } from "@/utils/GA";

import { BottomBar } from "./BottomBar";
import type { PostDetailsContentInstance } from "./Content";
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
  const contentRef = React.useRef<PostDetailsContentInstance>(null);
  const followAnimValue = useSharedValue<number>(0);
  const scrollVisibilityHandler = useScrollVisibilityHandler({ scrollThreshold: 30 });
  const postUri = usePostWebViewLink(params);

  const closeModal = React.useCallback(() => {
    setDisplayImageUris([]);
  }, []);

  const onTakeScreenshot = React.useCallback(async (): Promise<string> => contentRef.current.takeScreenshot(), []);

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

  useEffect(() => {
    followAnimValue.value = withDelay(1500, withSpring(1));
    GA.logEvent("start_reading_post", {
      node_id: params.noteId,
      character_id: params.characterId,
    });
  }, []);

  return (
    <>
      <Stack flex={1} backgroundColor={isDarkMode ? "black" : "white"}>
        <Header
          onTakeScreenshot={onTakeScreenshot}
          isExpandedAnimValue={scrollVisibilityHandler.isExpandedAnimValue}
          characterId={params.characterId}
          noteId={params.noteId}
          postUri={postUri}
          headerContainerHeight={headerContainerHeight}
        />
        <Content
          ref={contentRef}
          postUri={postUri ? `${postUri}?only-content=true` : undefined}
          renderHeaderComponent={(isCapturing) => {
            return (
              <YStack
                paddingTop={headerContainerHeight + top}
                backgroundColor={isDarkMode ? "black" : "white"}
              >
                <Stack paddingHorizontal={"$2"}>
                  <UserInfoHeader
                    replaceFollowButtonWithOtherComponent={isCapturing && qrCodeComponent}
                    characterId={params.characterId}
                  />
                </Stack>

                <Separator marginVertical="$4"/>
              </YStack>
            );
          }}
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
