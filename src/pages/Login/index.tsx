import type { FC } from "react";
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import BottomSheet from "@gorhom/bottom-sheet";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CharacterEntity } from "crossbell";
import { Stack, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { ConnectEmailButton } from "@/components/ConnectEmailButton";
import { ConnectionButton } from "@/components/ConnectionButton";
import { useAppIsActive } from "@/hooks/use-app-state";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import type { RootStackParamList } from "@/navigation/types";
import { withAnchorPoint } from "@/utils/anchor-point";

export interface Props {
}

const { width } = Dimensions.get("window");
const ITEM_HORIZONTAL_GAP = 24;
const ITEM_VERTICAL_GAP = 8;
const ITEM_WIDTH = width - 2 * ITEM_HORIZONTAL_GAP;
const ITEM_HEIGHT = 100 + 2 * ITEM_VERTICAL_GAP;

export const LoginPage: FC<NativeStackScreenProps<RootStackParamList, "Login">> = (props) => {
  const { navigation } = props;
  const globalLoading = useGlobalLoading();
  const navigateToTerms = () => navigation.navigate("Web", { url: "https://rss3.notion.site/Legal-Public-f30edd47c3be4dd7ae5ed4e39aefbbd9?pvs=4" });
  const { bottom } = useSafeAreaInsets();
  const isConnected = useIsConnected();
  const appIsActive = useAppIsActive();
  const { background } = useColors();

  useEffect(() => {
    if (appIsActive && isConnected) {
      globalLoading.hide();
      navigation.goBack();
    }
  }, [appIsActive, isConnected]);

  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["30%"], []);
  const onDismiss = useCallback(() => navigation.goBack(), []);

  return (
    <Stack flex={1} backgroundColor="$colorTransparent" onPress={() => navigation.goBack()}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onDismiss}
        index={0}
        backgroundStyle={{ backgroundColor: background }}
      >
        <YStack flex={1} alignItems="stretch" justifyContent="space-between" paddingHorizontal={24} paddingBottom={bottom} >
          <Text fontSize={"$2"} color={"$primary"} textAlign="center">Discovering amazing teams and creators on xLog!</Text>
          <ConnectionButton />
          <ConnectEmailButton />
          <Text color="$colorSubtitle" fontSize={"$3"} textAlign="center">
          By connecting you agree to our <Text textDecorationLine="underline" onPress={navigateToTerms} color="$color" fontSize={"$3"}>Terms & Conditions</Text>
          </Text>
        </YStack>
      </BottomSheet>
    </Stack>
  );
};

const CharacterCard: FC<{
  item: CharacterEntity
  index: number
  animationValue: Animated.SharedValue<number>
  parentLayoutHeight: number
}> = (props) => {
  const { item, animationValue, index, parentLayoutHeight } = props;
  const validItemLength = Math.max(Math.floor(parentLayoutHeight / ITEM_HEIGHT) - 1, 2);
  const validItemsArrayInput = Array.from({ length: validItemLength }).map((_, i) => i);
  const scaleValidItemsArrayOutput = Array.from({ length: validItemLength }).map((_, i) => 1);
  const rotateXValidItemsArrayOutput = Array.from({ length: validItemLength }).map((_, i) => 0);

  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationValue.value,
      [
        -1,
        ...validItemsArrayInput,
        validItemLength + 1,
      ],
      [
        0.8,
        ...scaleValidItemsArrayOutput,
        0.9,
      ],
      Extrapolate.CLAMP,
    );

    const translateY = interpolate(
      animationValue.value,
      [
        -1,
        ...validItemsArrayInput,
        validItemLength + 1,
      ],
      [
        ITEM_HEIGHT * 0.3,
        ...scaleValidItemsArrayOutput,
        0,
      ],
    );

    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0, 1, 1],
      Extrapolate.CLAMP,
    );

    const transform = {
      transform: [
        { scale },
        { translateY },
        { perspective: 200 },
        {
          rotateX: `${interpolate(
            animationValue.value,
            [
              -1,
              ...validItemsArrayInput,
              validItemLength + 1,
            ],
            [
              50,
              ...rotateXValidItemsArrayOutput,
              -15,
            ],
            Extrapolate.CLAMP,
          )}deg`,
        },
      ],
    };

    return {
      opacity,
      ...withAnchorPoint(
        transform,
        { x: 0.5, y: 0.5 },
        { width: ITEM_WIDTH, height: ITEM_HEIGHT },
      ),
    };
  }, [index]);

  return (
    <Animated.View style={cardStyle}>
      <XStack height={ITEM_HEIGHT} paddingBottom={ITEM_VERTICAL_GAP} backgroundColor={"$background"}>
        <XStack flex={1} alignItems="center" gap="$3" borderWidth={1} borderColor={"$borderColor"} borderRadius={"$5"} paddingHorizontal={"$3"}>
          <Avatar size={42} character={item} isNavigateToUserInfo={false}/>
          <YStack flex={1} gap="$2">
            <Text numberOfLines={1} color={"$color"} fontSize={"$7"} fontWeight={"$10"}>{item.metadata?.content?.name}</Text>
            {item.metadata?.content?.bio && <Text color="$colorSubtitle" numberOfLines={2}>{item.metadata?.content?.bio}</Text>}
          </YStack>
        </XStack>
      </XStack>
    </Animated.View>
  );
};
