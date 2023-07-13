import type { FC } from "react";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Linking, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle, interpolateColor } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Image as ImageIcon, Link, MoreHorizontal, Twitter } from "@tamagui/lucide-icons";
import type { IconProps } from "@tamagui/lucide-icons/types/IconProps";
import { useToastController } from "@tamagui/toast";
import * as Clipboard from "expo-clipboard";
import * as MediaLibrary from "expo-media-library";
import * as Sentry from "sentry-expo";
import type { StackProps } from "tamagui";
import { useWindowDimensions, Button, Spacer, H4, SizableText, Stack, XStack, YStack } from "tamagui";

import type { AlertDialogInstance } from "@/components/AlertDialog";
import { AlertDialog } from "@/components/AlertDialog";
import { AutoFillImage } from "@/components/AutoFillImage";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import { XTouch } from "@/components/XTouch";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useHitSlopSize } from "@/hooks/use-hit-slop-size";
import { useGetPage } from "@/queries/page";
import { useGetSite } from "@/queries/site";
import { GA } from "@/utils/GA";
import { getNoteSlug } from "@/utils/get-slug";
import { getTwitterShareUrl } from "@/utils/helpers";

export interface Props {
  isExpandedAnimValue: SharedValue<0 | 1>
  characterId: number
  noteId: number
  postUri: string
  headerContainerHeight: number
  onTakeScreenshot: () => Promise<string>
}

export const Header: FC<Props> = (props) => {
  const { isExpandedAnimValue, onTakeScreenshot, postUri, characterId, noteId, headerContainerHeight } = props;
  const { goBack } = useNavigation();
  const [dashboardT] = useTranslation("dashboard");
  const [commonT] = useTranslation("common");
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useRef([200]).current;
  const { height } = useWindowDimensions();
  const { background, backgroundFocus, primary } = useColors();
  const toast = useToastController();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const hitSlop = useHitSlopSize(44);
  const globalLoading = useGlobalLoading();
  const alertDialogRef = useRef<AlertDialogInstance>(null);
  const [generatedImageUri, setGeneratedImageUri] = React.useState<string | null>(null);

  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note.data),
      useStat: true,
    },
  );

  const site = useGetSite(character?.data?.handle);
  const { top } = useSafeAreaInsets();
  const headerHeight = top + headerContainerHeight;

  const titleAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isExpandedAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  const headerBgAnimStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(isExpandedAnimValue.value, [0, 1], ["transparent", background]),
    };
  }, [background]);

  const backBtnAnimStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(isExpandedAnimValue.value, [0, 1], [backgroundFocus, background]),
    };
  }, [background, primary]);

  const openBottomSheetModal = () => {
    bottomSheetRef.current?.present();
  };

  const closeBottomSheetModal = () => {
    bottomSheetRef.current?.close();
  };

  const closeAlertDialog = () => {
    alertDialogRef.current?.toggle(false);
  };

  const handleCopyLink = () => {
    GA.logShare({
      item_id: noteId.toString(),
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
    alertDialogRef.current?.toggle(true);
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
      item_id: noteId.toString(),
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
        item_id: noteId.toString(),
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

  return (
    <>
      <Animated.View style={[{
        paddingTop: top + 5,
        height: headerHeight,
        width: "100%",
        position: "absolute",
        zIndex: 2,
      }, headerBgAnimStyles]}>
        <TouchableWithoutFeedback onPress={() => goBack()} containerStyle={{
          position: "absolute",
          left: 8,
          top: top + 5,
          zIndex: 2,
        }}>
          <Animated.View style={[backBtnAnimStyle, {
            width: 35,
            height: 35,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
          }]}>
            <ArrowLeft width={30} />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.headerContainer, titleAnimStyles]}>
          <XStack width={"70%"} justifyContent="center" alignItems="center">
            <H4 textAlign="center" numberOfLines={1}>
              {note.data?.metadata?.content?.title}
            </H4>
          </XStack>
        </Animated.View>
        <Animated.View
          style={[
            {
              borderRadius: 50,
              width: 35,
              height: 35,
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: 8,
              top: top + 5,
              zIndex: 2,
            },
            titleAnimStyles,
          ]}
        >
          <XTouch touchableComponent={TouchableOpacity} onPress={openBottomSheetModal} {...hitSlop}>
            <MoreHorizontal color="$color" />
          </XTouch>
        </Animated.View>
      </Animated.View>

      <AlertDialog
        ref={alertDialogRef}
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
        backgroundStyle={{ backgroundColor: background }}
      >
        <SizableText size={"$6"} fontWeight={"700"} textAlign="center">
          {commonT("Share Post")}
        </SizableText>
        <Spacer size="$3"/>
        <ScrollView horizontal>
          <XStack gap="$4" marginHorizontal="$3">
            {/* TODO 🌴 */}
            <ShareItem backgroundColor="#1DA1F2" icon={Twitter} title="Twitter" onPress={handleShareOnTwitter} />
            <ShareItem backgroundColor="#f3922a" icon={Link} title={commonT("Link")} onPress={handleCopyLink} />
            <ShareItem backgroundColor="#f3922a" icon={ImageIcon} title={commonT("Image")} onPress={handleTakeScreenShot} />
          </XStack>
        </ScrollView>
      </BottomSheetModal>
    </>
  );
};

const ShareItem: FC<{
  icon: React.ExoticComponent<IconProps>
  backgroundColor: StackProps["backgroundColor"]
  title: string
  onPress: () => void
}> = ({ icon: Icon, title, onPress, backgroundColor }) => {
  const size = 60;
  return (
    <XTouch onPress={onPress} touchableComponent={TouchableWithoutFeedback}>
      <YStack alignItems="center" gap="$1">
        <Stack width={size} height={size} alignItems="center" justifyContent="center" borderRadius={50} backgroundColor={backgroundColor}>
          <Icon size={size / 2}/>
        </Stack>
        <SizableText numberOfLines={1}>{title}</SizableText>
      </YStack>
    </XTouch>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
