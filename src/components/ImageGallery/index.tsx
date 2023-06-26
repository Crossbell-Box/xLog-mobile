import { useState, type FC, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Download, Loader } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { Circle, Spinner, Stack } from "tamagui";

import { useHitSlopSize } from "@/hooks/use-hit-slop-size";

import { ModalWithFadeAnimation } from "../ModalWithFadeAnimation";

const { width, height } = Dimensions.get("window");

interface Props {
  uris: string[]
  isVisible: boolean
  onClose?: () => void
}

export const ImageGallery: FC<Props> = (props) => {
  const { uris, isVisible, onClose } = props;
  const i18n = useTranslation("common");
  const { bottom } = useSafeAreaInsets();
  const toast = useToastController();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const hitSlop = useHitSlopSize(44);

  useEffect(() => {
    if (isVisible) {
      setCurrentImageIndex(0);
    }
  }, [isVisible]);

  const saveImage = useCallback(async (uri: string) => {
    setIsSavingImage(true);

    try {
      const mediaLibraryPermissions = await MediaLibrary.requestPermissionsAsync();
      if (!mediaLibraryPermissions.granted) {
        return;
      }

      const localFile = await FileSystem.downloadAsync(
        uri,
        `${FileSystem.documentDirectory}${Date.now()}.jpg`,
      );

      await MediaLibrary.saveToLibraryAsync(localFile.uri);

      toast.show(i18n.t("Image saved successfully"), {
        burntOptions: {
          preset: "done",
          haptic: "success",
        },
      });
    }
    catch (error) {
      console.error(error);
      toast.show(i18n.t("Failed to save image"), {
        burntOptions: {
          preset: "error",
          haptic: "error",
        },
      });
    }
    finally {
      setIsSavingImage(false);
    }
  }, []);

  return (
    <ModalWithFadeAnimation
      style={styles.modal}
      propagateSwipe
      useNativeDriver
      isVisible={isVisible}
      hideModalContentWhileAnimating
      onBackdropPress={onClose}
    >
      <Stack flex={1}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={uris.length > 1}
          onMomentumScrollEnd={(event) => {
            const slideIndex = Math.ceil(
              event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
            );
            if (slideIndex !== currentImageIndex) {
              setCurrentImageIndex(slideIndex);
            }
          }}
        >
          {
            uris.map((uri, index) => {
              const priority = index <= 3 ? "high" : "low";
              return (
                <ImageItem key={index} uri={uri} priority={priority} onPress={onClose}/>
              );
            })
          }
        </ScrollView>
      </Stack>
      <Stack
        onLayout={hitSlop.onLayout}
        hitSlop={hitSlop.hitSlop}
        onPress={(e) => {
          e.stopPropagation();
          saveImage(uris[currentImageIndex]);
        }}
        position="absolute"
        bottom={bottom + 30}
        zIndex={2}
        left={30}
        disabled={isSavingImage}
        backgroundColor="$background"
        width={44}
        height={44}
        borderRadius={22}
        alignItems="center"
        justifyContent="center"
      >
        {
          isSavingImage
            ? (
              <Circle enterStyle={{ rotateZ: "360deg" }} rotateZ="0deg" animation={"bouncy"}>
                <Loader />
              </Circle>
            )
            : <Download color="white" />
        }
      </Stack>
    </ModalWithFadeAnimation>
  );
};

const ImageItem: FC<{ uri: string; priority: "high" | "low";onPress: () => void }> = (props) => {
  const { uri, priority, onPress } = props;
  const [loading, setLoading] = useState(true);

  const onLoadStart = useCallback(() => {
    setLoading(true);
  }, []);

  const onLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <Stack width={width} height={height} alignItems="center" justifyContent="center" onPress={onPress}>
      <Image onLoadStart={onLoadStart} onLoadEnd={onLoadEnd} priority={priority} source={uri} contentFit="contain" style={styles.modalImage}/>
      {loading && <Spinner position="absolute"/>}
    </Stack>
  );
};

const styles = StyleSheet.create({
  singleImageWrapper: {
    flex: 1,
  },
  multipleImageWrapper: {
    flex: 1,
  },
  modalImage: {
    width,
    height,
  },
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});

