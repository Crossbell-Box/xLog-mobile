import { useState, type FC, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera, useCameraDevice } from "react-native-vision-camera";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowRight, ChevronLeft, SwitchCamera, Trash } from "@tamagui/lucide-icons";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { Circle, Stack, XStack } from "tamagui";

import { Button } from "@/components/Base/Button";
import { Center } from "@/components/Base/Center";
import { XTouch } from "@/components/XTouch";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useToggle } from "@/hooks/use-toggle";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
  photos: Photo[]
}

export interface Photo {
  uri: string
  width: number
  height: number
}

export const TakePhotoPage: FC<NativeStackScreenProps<RootStackParamList, "TakePhoto">> = (props) => {
  const { route } = props;
  const i18n = useTranslation("common");
  const [cameraType, setCameraType] = useState<"back" | "front">("back");
  const device = useCameraDevice(cameraType);
  const [pictures, setPictures] = useState<Array<Photo>>(route.params?.photos || []);
  const { top } = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useRootNavigation();
  const itemSize = 80;
  const itemGap = 8;

  const toggleCameraType = () => {
    setCameraType(cameraType === "back" ? "front" : "back");
  };

  const handleRemoveImage = (uri: string) => {
    setPictures(pictures => pictures.filter(picture => picture.uri !== uri));
  };

  const onPictureSaved = async (result: { uri: string; width: number; height: number }) => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
    await new Promise(resolve => setTimeout(resolve, 250));
    setPictures(pictures => [
      ...pictures,
      {
        uri: result.uri,
        width: result.width,
        height: result.height,
      },
    ]);
  };

  const takePhoto = async () => {
    cameraRef.current.takePhoto().then((result) => {
      return onPictureSaved({
        uri: `file://${result.path}`,
        width: result.width,
        height: result.height,
      });
    });
  };

  const onHandleNext = () => {
    navigation.replace("CreateShots", {
      assets: pictures,
    });
  };

  return (
    <>
      <Stack flex={1} backgroundColor={"$cardBackground"} >
        <Camera
          ref={cameraRef}
          device={device}
          isActive
          photo={true}
          video={false}
          audio={false}
          style={styles.camera}
        >
          <XTouch onPress={navigation.goBack} enableHaptics containerStyle={{
            position: "absolute",
            top: top + 10,
            left: 12,
          }}>
            <ChevronLeft size="$3" color="white"/>
          </XTouch>
        </Camera>

        {pictures.length > 0 && (
          <XStack
            animation={"quick"}
            enterStyle={{ y: 100 }}
            height={100}
            y={0}
            backgroundColor={"$cardBackground"}
            width={"100%"}
            alignItems="center"
          >
            <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: itemGap }}>
              {
                pictures.map((picture) => {
                  return (
                    <Stack
                      justifyContent="space-between"
                      key={picture.uri}
                      animation={"quick"}
                      enterStyle={{
                        y: itemSize,
                        opacity: 0,
                      }}
                      y={0}
                      opacity={1}
                      w={itemSize}
                      h={itemSize}
                      marginRight={itemGap}
                    >
                      <Image
                        source={{ uri: picture.uri }}
                        style={{
                          width: itemSize,
                          height: itemSize,
                          borderRadius: 10,
                          overflow: "hidden",
                        }}
                        contentFit="cover"
                      />

                      <Stack position="absolute" right="$2" bottom="$2">
                        <XTouch onPress={() => handleRemoveImage(picture.uri)} enableHaptics>
                          <Trash color="white" size="$1"/>
                        </XTouch>
                      </Stack>
                    </Stack>
                  );
                })
              }

              <Stack
                width={itemSize}
                height={itemSize}
                marginRight={100}
                alignItems="center"
                justifyContent="center"
              />
              <Button
                onPress={onHandleNext}
                animation={"quick"}
                width={itemSize}
                height={itemSize}
                position="absolute"
                enterStyle={{ opacity: 0 }}
                left={0}
                x={(itemGap + itemSize) * pictures.length + itemGap}
                opacity={1}
                backgroundColor={"$primary"}
                color={"white"}
                iconAfter={<ArrowRight/>}
                padding="$0"
              >
                {i18n.t("Next")}
              </Button>
            </ScrollView>
          </XStack>
        )}

        <SafeAreaView edges={["bottom"]}>
          <XStack height={"$10"} justifyContent="center">
            <Circle>
              <XTouch onPress={takePhoto} enableHaptics>
                <Center>
                  <Button size={"$7"} circular backgroundColor={"$primary"} />
                  <Circle position="absolute" borderColor={"$cardBackground"} borderWidth={1} size={"$6"}/>
                </Center>
              </XTouch>
            </Circle>
            <Circle position="absolute" right={"$4"} alignSelf="center">
              <XTouch onPress={toggleCameraType} enableHaptics>
                <Button
                  circular
                  size={"$4"}
                  icon={<SwitchCamera color="$cardBackground" size="$2"/>}
                  backgroundColor={"white"}
                />
              </XTouch>
            </Circle>
          </XStack>
        </SafeAreaView>
      </Stack>
    </>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
