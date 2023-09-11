import { useState, type FC, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import Animated, { BounceInRight, Easing, FadeInDown, FadeOutDown, ZoomInLeft, ZoomInRight, ZoomOutRight, useAnimatedStyle } from "react-native-reanimated";

import { Album, Camera, Image, Plus } from "@tamagui/lucide-icons";
import { AnimatePresence, Button, Circle, Square, Stack, useControllableState, useEvent } from "tamagui";

import { useCreateShots } from "@/hooks/use-create-shots";
import { useRootNavigation } from "@/hooks/use-navigation";

import { Center } from "./Base/Center";
import { MeasureContainer } from "./utils/MeasureContainer";

const buttonSize = 65;

const buttonAnimList = [
  {
    rotate: "0deg",
  },
  {
    rotate: "-45deg",
  },
];

const buttonContainerAnimList = [
  {
    backgroundColor: "$primary",
    opacity: 1,
  },
  {
    backgroundColor: "#cbcbcbca",
    opacity: 0.6,
  },
];

export const CreateShortsButton: FC = () => {
  const { createShots } = useCreateShots();
  const [animIndex, setAnimIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isSelectingMethod, setIsSelectingMethod] = useState(false);
  const navigation = useRootNavigation();

  const buttonAnim = buttonAnimList[animIndex];
  const buttonContainerAnim = buttonContainerAnimList[animIndex];

  const handleOnPress = () => {
    setIsSelectingMethod(!isSelectingMethod);
  };

  const handleOpenCamera = () => {
    navigation.navigate("TakePhoto");
  };

  useEffect(() => {
    if (isSelectingMethod) {
      setAnimIndex(1);
    }
    else {
      setAnimIndex(0);
    }
  }, [isSelectingMethod]);

  return (
    <MeasureContainer
      style={{ marginHorizontal: 12 }}
      onDimensionsChange={(e) => {
        setContainerWidth(e.width);
      }}
    >
      <Stack>
        <AnimatePresence>
          {isSelectingMethod && (
            <>
              <Center
                flex={1}
                borderRadius={50}
                backgroundColor={"$primary"}
                style={styles.actionButtonContainer}
                animation={"quick"}
                enterStyle={{
                  y: 0,
                  x: 0,
                  opacity: 0,
                }}
                exitStyle={{
                  y: 0,
                  x: 0,
                  opacity: 0,
                }}
                y={-buttonSize * 1.3}
                x={0 + (containerWidth - buttonSize) / 2 - buttonSize}
                opacity={1}
                onPress={() => {
                  setIsSelectingMethod(false);
                  handleOpenCamera();
                }}
              >
                <Camera color="white"/>
              </Center>
              <Center
                flex={1}
                borderRadius={50}
                backgroundColor={"$primary"}
                style={styles.actionButtonContainer}
                animation={"quick"}
                enterStyle={{
                  y: 0,
                  x: 0,
                  opacity: 0,
                }}
                exitStyle={{
                  y: 0,
                  x: 0,
                  opacity: 0,
                }}
                y={-buttonSize * 1.3}
                x={0 + (containerWidth - buttonSize) / 2 + buttonSize}
                opacity={1}
                onPress={() => {
                  setIsSelectingMethod(false);
                  createShots();
                }}
              >
                <Image color="white"/>
              </Center>
            </>
          )}
        </AnimatePresence>

        <Button
          size={"$3"}
          borderWidth={0}
          onPress={handleOnPress}
          backgroundColor={"$primary"}
          animation={"bouncy"}
          opacity={1}
          {...buttonContainerAnim}
        >
          <Stack animation={"bouncy"} rotate={"0deg"} {...buttonAnim}>
            <Plus color="white"/>
          </Stack>
        </Button>
      </Stack>
    </MeasureContainer>
  );
};

const styles = StyleSheet.create({
  actionButtonContainer: {
    width: buttonSize,
    height: buttonSize,
    position: "absolute",
    borderRadius: buttonSize / 2,
  },
});
