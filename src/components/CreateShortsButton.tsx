import { useState, type FC, useRef } from "react";
import type { ScrollView as RNScrollVIew } from "react-native";
import { InteractionManager, StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { Easing, runOnJS, interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming, LinearTransition, FadeInLeft } from "react-native-reanimated";
import { Camera, useCameraPermission, useCameraDevice } from "react-native-vision-camera";

import { Maximize2, Plus, X } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { Button, ScrollView, Stack, View, XStack, YStack, useWindowDimensions } from "tamagui";

import { IS_ANDROID } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useCreateShots } from "@/hooks/use-create-shots";
import { useIsLogin } from "@/hooks/use-is-login";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { Photo } from "@/pages/TakePhoto";

import { XTouch } from "./XTouch";

export const CreateShortsButton: FC = () => {
  const { createShots } = useCreateShots();
  const navigation = useRootNavigation();
  const isLogin = useIsLogin();
  const { width } = useWindowDimensions();
  const { primary } = useColors();
  const buttonSize = 40;
  const [mediaPermissionResponse, requestMediaPermission] = MediaLibrary.usePermissions();
  const [photos, setPhotos] = useState<Array<Photo>>([]);
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("back");
  const [selectedPhotos, setSelectedPhotos] = useState<Array<Photo>>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const [expanded, setExpanded] = useState(false);
  const scrollViewRef = useRef<RNScrollVIew>(null);

  const requestPermissions = async () => {
    if (mediaPermissionResponse?.granted && hasPermission) {
      return;
    }

    if (!mediaPermissionResponse?.granted) {
      await requestMediaPermission();
    }

    if (!hasPermission) {
      await requestPermission();
    }
  };

  const refreshPhotos = async () => {
    MediaLibrary.getAlbumAsync("Camera Roll").then(album => MediaLibrary.getAssetsAsync({
      first: 6,
      mediaType: "photo",
      album,
    })).then((result) => {
      setPhotos(result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      })));
    });
  };

  const takePhoto = async () => {
    if (isCapturing) {
      return;
    }

    setIsCapturing(true);
    cameraRef?.current.takePhoto().then((result) => {
      const uri = `file://${result.path}`;
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
      setPhotos(photos => [
        {
          uri,
          width: result.width,
          height: result.height,
        },
        ...photos,
      ]);

      setSelectedPhotos(selectedPhotos => [
        {
          uri,
          width: result.width,
          height: result.height,
        },
        ...selectedPhotos,
      ]);
    })
      .finally(() => {
        setIsCapturing(false);
      });
  };

  const toggle = () => {
    return requestPermissions()
      .then(() => {
        isOpenAnimValue.value = withTiming(isOpenAnimValue.value === 0 ? 1 : 0, { easing: Easing.inOut(Easing.ease), duration: 150 }, () => {
          const isClosed = isOpenAnimValue.value === 0;
          if (isClosed) {
            runOnJS(setSelectedPhotos)([]);
            runOnJS(setExpanded)(false);
          }
          else {
            runOnJS(refreshPhotos)();
            runOnJS(setExpanded)(true);
          }
        });
      });
  };

  const handleOnPress = () => {
    if (!isLogin) {
      navigation.navigate("Login");
      return;
    }

    toggle();
  };

  const handleOpenCamera = async () => {
    if (!hasPermission) {
      await requestPermission();
    }

    navigation.navigate("TakePhoto", {
      photos: selectedPhotos,
    });
    toggle();
  };

  const isOpenAnimValue = useSharedValue(0);
  const targetWidth = width * 0.96;
  const targetHeight = 300;

  const containerAnimStyle = useAnimatedStyle(() => {
    const animValue = Math.max(0, isOpenAnimValue.value);

    return {
      width: interpolate(animValue, [0, 1], [buttonSize, targetWidth]),
      height: interpolate(animValue, [0, 1], [buttonSize, targetHeight]),
      bottom: interpolate(animValue, [0, 1], [0, -buttonSize / 2]),
      backgroundColor: interpolateColor(animValue, [0, 1], [primary, "rgba(0,0,0,0)"]),
    };
  }, [
    targetWidth,
    targetHeight,
  ]);

  const actionsContainerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isOpenAnimValue.value, [0, 1], [0, 1]),
    };
  }, []);

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isOpenAnimValue.value, [0, 1], [1, 0]),
    };
  }, []);

  const onHandleNext = async () => {
    const assets = selectedPhotos.slice();

    toggle();

    await new Promise((resolve) => { setTimeout(resolve, 300); });

    navigation.push("CreateShots", {
      assets,
    });
  };

  return (
    <Stack width={buttonSize} height={buttonSize} marginHorizontal={15} overflow="visible" zIndex={999}>
      <Animated.View
        style={[{
          borderRadius: 10,
          alignSelf: "center",
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          flex: 1,
        }, containerAnimStyle]}
      >
        <Animated.View style={[actionsContainerAnimStyle, { width: targetWidth, height: targetHeight, position: "absolute", borderRadius: 10, padding: 12 }]}>
          <BlurView tint="dark" intensity={IS_ANDROID ? 10 : 30} style={StyleSheet.absoluteFillObject}/>
          <XStack flex={1} gap={6}>
            <XStack flex={1} >
              <ScrollView ref={scrollViewRef} flex={1}>
                <XStack flexWrap="wrap" justifyContent="space-between">
                  {
                    mediaPermissionResponse?.granted && photos.map((item) => {
                      const photoSize = targetWidth / 4 * 0.9;
                      const isSelected = selectedPhotos.some(photo => photo.uri === item.uri);

                      return (
                        <Animated.View key={item.uri} layout={LinearTransition.duration(150)} entering={FadeInLeft.duration(150)}>
                          <TouchableWithoutFeedback
                            style={{ marginBottom: 4 }}
                            onPress={() => {
                              if (isSelected) {
                                setSelectedPhotos(selectedPhotos.filter(({ uri }) => uri !== item.uri));
                                return;
                              }

                              setSelectedPhotos([...selectedPhotos, item]);
                            }}
                          >
                            <View width={photoSize} height={photoSize}>
                              <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }}/>
                              <Stack
                                position="absolute"
                                right="$2"
                                bottom="$2"
                                width={15}
                                height={15}
                                borderRadius={50}
                                alignItems="center"
                                justifyContent="center"
                                borderWidth={1}
                                borderColor={"white"}
                              >
                                {isSelected && <Stack width={10} height={10} borderRadius={50} backgroundColor={"$primary"}/>}
                              </Stack>
                            </View>
                          </TouchableWithoutFeedback>
                        </Animated.View>
                      );
                    })
                  }
                </XStack>
              </ScrollView>
            </XStack>
            <YStack flex={1} gap={8} borderRadius={10}>
              <Stack flex={1} borderRadius={10} overflow="hidden">
                {hasPermission && (
                  <Stack flex={1}>
                    {device && (
                      <Camera
                        ref={cameraRef}
                        device={device}
                        isActive={expanded}
                        photo={true}
                        video={false}
                        audio={false}
                        style={{ flex: 1 }}
                      />
                    )}
                    <XTouch onPress={handleOpenCamera} enableHaptics containerStyle={{
                      position: "absolute",
                      right: 12,
                      top: 12,
                    }}>
                      <Maximize2 color="white" size={25}/>
                    </XTouch>

                    <XTouch onPress={takePhoto} enableHaptics containerStyle={{
                      position: "absolute",
                      left: "50%",
                      bottom: 12,
                      transform: [{ translateX: -15 }],
                    }}>
                      <Stack borderRadius={50} borderWidth={1} borderColor={"white"} width={30} height={30} alignItems="center" justifyContent="center">
                        <Stack
                          borderRadius={50}
                          backgroundColor={"white"}
                          width={25}
                          height={25}
                        />
                      </Stack>
                    </XTouch>
                  </Stack>
                )}
              </Stack>
              <XStack alignItems="center" justifyContent="space-between" width={"100%"} gap={8}>
                <Button
                  flex={1}
                  disabled={selectedPhotos.length === 0}
                  backgroundColor={selectedPhotos.length === 0 ? "$backgroundHover" : "$primary"}
                  onPress={onHandleNext}
                >
                Next
                </Button>
                <Button onPress={toggle} backgroundColor={"$backgroundHover"} icon={<X size={22}/>} padding={12}/>
              </XStack>
            </YStack>
          </XStack>
        </Animated.View>

        <Animated.View style={[buttonAnimStyle, { flex: 1, justifyContent: "center", alignItems: "center" }]}>
          <TouchableWithoutFeedback onPress={handleOnPress}>
            <Stack flex={1} alignItems="center" justifyContent="center">
              <Plus color="white"/>
            </Stack>
          </TouchableWithoutFeedback>
        </Animated.View>
      </Animated.View>
    </Stack>
  );
};
