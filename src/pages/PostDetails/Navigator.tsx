import type { FC } from "react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle, interpolateColor, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import { HeaderBackButton } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { IconProps } from "@tamagui/helpers-icon";
import { ArrowLeft, ChevronLeft, Image as ImageIcon, Link, MoreHorizontal, X } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import type { NoteEntity } from "crossbell";
import * as Clipboard from "expo-clipboard";
import type { ImageSource } from "expo-image";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import * as Sentry from "sentry-expo";
import type { StackProps } from "tamagui";
import { useWindowDimensions, Button, Spacer, H4, SizableText, Stack, XStack, YStack, Circle } from "tamagui";

import { AlertDialog } from "@/components/AlertDialog";
import { AutoFillImage } from "@/components/AutoFillImage";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { XTouch } from "@/components/XTouch";
import { IS_ANDROID } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { useToggle } from "@/hooks/use-toggle";
import { useGetPage } from "@/queries/page";
import { useGetSite } from "@/queries/site";
import { GA } from "@/utils/GA";
import { getNoteSlug } from "@/utils/get-slug";
import { getTwitterShareUrl } from "@/utils/helpers";

export interface Props {
  isExpandedAnimValue: SharedValue<number>
  characterId: number
  note: NoteEntity
  postUri: string
  headerContainerHeight: number
  onTakeScreenshot: () => Promise<string>
}

export const Navigator: FC<Props> = (props) => {
  const { isExpandedAnimValue, onTakeScreenshot, postUri, characterId, note, headerContainerHeight } = props;
  const { goBack } = useNavigation();
  const [dashboardT] = useTranslation();
  const [commonT] = useTranslation("common");
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useRef([200]).current;
  const { height } = useWindowDimensions();
  const { pick } = useColors();
  const toast = useToastController();
  const character = useCharacter(characterId);
  const hitSlop = useHitSlopSize(44);
  const globalLoading = useGlobalLoading();
  const [visible, toggle] = useToggle(false);
  const [generatedImageUri, setGeneratedImageUri] = React.useState<string | null>(null);

  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note),
      useStat: true,
    },
  );

  const site = useGetSite(character?.data?.handle);
  const { top } = useSafeAreaInsets();
  const headerHeight = top + headerContainerHeight;

  const hiddenAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isExpandedAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  const openBottomSheetModal = () => {
    bottomSheetRef.current?.present();
  };

  const closeBottomSheetModal = () => {
    bottomSheetRef.current?.close();
  };

  const closeAlertDialog = () => {
    toggle(false);
  };

  const handleCopyLink = () => {
    GA.logShare({
      item_id: note.noteId?.toString(),
      method: "copy link",
      content_type: "post",
    });

    Clipboard.setStringAsync(postUri).then(() => {
      toast.show(commonT("Post Link Copied"), {
        burntOptions: {
          preset: "done",
          haptic: "success",
        },
      });
      closeBottomSheetModal();
    });
  };

  const handleTakeScreenShot = async () => {
    closeBottomSheetModal();
    const uri = await onTakeScreenshot();
    setGeneratedImageUri(uri);
    toggle(true);
  };

  const clearGeneratedImage = async () => {
    setGeneratedImageUri(null);
    MediaLibrary.deleteAssetsAsync([generatedImageUri!]);
  };

  const onCancel = async () => {
    GA.logEvent("cancel_saving_image");
    closeAlertDialog();
    await clearGeneratedImage();
  };

  const handleShareOnTwitter = () => {
    GA.logShare({
      item_id: note.noteId?.toString(),
      method: "twitter",
      content_type: "post",
    });

    Linking.openURL(getTwitterShareUrl({
      page: page.data,
      site: site.data,
      t: dashboardT,
      isMyPost: false,
    }));
  };

  const handleSaveImage = async () => {
    try {
      globalLoading.show();
      const mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
      if (!mediaLibraryPermissions.granted) {
        toast.show(commonT("Permission denied"), {
          burntOptions: {
            preset: "none",
            haptic: "warning",
          },
        });
        return;
      }
      await MediaLibrary.saveToLibraryAsync(generatedImageUri);

      GA.logShare({
        item_id: note.noteId?.toString(),
        method: "save image",
        content_type: "post",
      });

      toast.show(commonT("Image saved successfully"), {
        burntOptions: {
          preset: "done",
          haptic: "success",
        },
      });

      closeAlertDialog();
      await clearGeneratedImage();
    }
    catch (error) {
      Sentry.Native.captureException(error);
      toast.show(commonT("Failed to save image"), {
        burntOptions: {
          preset: "none",
          haptic: "error",
        },
      });
    }
    finally {
      globalLoading.hide();
    }
  };

  const topPos = top + (IS_ANDROID ? 15 : 5);

  return (
    <>
      <Animated.View
        style={[hiddenAnimStyles, {
          zIndex: 2,
          width: "100%",
          paddingTop: topPos,
          position: "absolute",
          height: headerHeight,
          backgroundColor: "transparent",
        }]}
        entering={FadeInUp.duration(150)}
      >
        <TouchableWithoutFeedback onPress={() => goBack()} containerStyle={{
          position: "absolute",
          left: 16,
          top: topPos,
          zIndex: 2,
        }}>
          <Circle
            width={35}
            height={35}
            alignItems="center"
            justifyContent="center"
            backgroundColor="#EFEFEF"
            paddingRight={3}
            theme="dark"
          >
            <ChevronLeft size={30} color="$background"/>
          </Circle>

        </TouchableWithoutFeedback>

        <Circle
          width={35}
          height={35}
          alignItems="center"
          justifyContent="center"
          backgroundColor="#EFEFEF"
          position="absolute"
          right={16}
          top={topPos}
          zIndex={2}
          theme="dark"
        >
          <XTouch touchableComponent={TouchableOpacity} onPress={openBottomSheetModal} {...hitSlop}>
            <MoreHorizontal color="$background" />
          </XTouch>
        </Circle>
      </Animated.View>

      <AlertDialog
        visible={visible}
        title={undefined}
        containerStyle={{
          paddingLeft: 4,
          paddingRight: 4,
        }}
        description={(
          <ScrollView style={{ height: height * 0.7 }}>
            <AutoFillImage uri={generatedImageUri} contentFit={"contain"} />
          </ScrollView>
        )}
        renderCancel={() => <Button onPress={onCancel}>{commonT("Cancel")}</Button>}
        renderConfirm={() => <Button backgroundColor={"$primary"} onPress={handleSaveImage}>{commonT("Save")}</Button>}
      />

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        backgroundStyle={{ backgroundColor: pick("bottomSheetBackground") }}
        onPressBackdrop={closeBottomSheetModal}
      >
        <SizableText size={"$6"} fontWeight={"700"} textAlign="center">
          {commonT("Share Post")}
        </SizableText>
        <Spacer size="$3"/>
        <ScrollView horizontal>
          <XStack gap="$4" marginHorizontal="$3">
            {/* TODO 🌴 */}
            <ShareItem backgroundColor="black" image={require("../../assets/x.png")} title="X" onPress={handleShareOnTwitter} />
            <ShareItem backgroundColor="black" icon={Link} title={commonT("Link")} onPress={handleCopyLink} />
            <ShareItem backgroundColor="black" icon={ImageIcon} title={commonT("Image")} onPress={handleTakeScreenShot} />
          </XStack>
        </ScrollView>
      </BottomSheetModal>
    </>
  );
};

const ShareItem: FC<{
  icon?: React.ExoticComponent<IconProps>
  image?: ImageSource
  backgroundColor: StackProps["backgroundColor"]
  title: string
  onPress: () => void
}> = ({ icon: Icon, image, title, onPress, backgroundColor }) => {
  const size = 60;
  return (
    <XTouch onPress={onPress} touchableComponent={TouchableWithoutFeedback}>
      <YStack alignItems="center" gap="$1">
        <Stack width={size} height={size} alignItems="center" justifyContent="center" borderRadius={50} backgroundColor={backgroundColor}>
          {Icon ? <Icon color="white" size={size / 2}/> : <Image source={image} style={{ width: size / 2, height: size / 2 }}/>}
        </Stack>
        <SizableText numberOfLines={1}>{title}</SizableText>
      </YStack>
    </XTouch>
  );
};
