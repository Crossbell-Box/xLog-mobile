import type { FC } from "react";
import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, { Easing, Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected, useIsWalletSignedIn } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CharacterEntity } from "crossbell";
import { Stack, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { ConnectionButton } from "@/components/ConnectionButton";
import { MeasuredContainer } from "@/components/MeasuredContainer";
import { useAppIsActive } from "@/hooks/use-app-state";
import type { RootStackParamList } from "@/navigation/types";
import { useGetShowcase } from "@/queries/home";
import { withAnchorPoint } from "@/utils/anchor-point";

export interface Props {
}

const { width } = Dimensions.get("window");
const ITEM_HORIZONTAL_GAP = 24;
const ITEM_VERTICAL_GAP = 8;
const ITEM_WIDTH = width - 2 * ITEM_HORIZONTAL_GAP;
const ITEM_HEIGHT = 100 + 2 * ITEM_VERTICAL_GAP;

export const LoginPage: FC<NativeStackScreenProps<RootStackParamList, "Web">> = (props) => {
  const { navigation } = props;
  const showcaseSites = useGetShowcase();
  const navigateToTerms = () => navigation.navigate("Web", { url: "https://rss3.notion.site/Legal-Public-f30edd47c3be4dd7ae5ed4e39aefbbd9?pvs=4" });
  const { bottom } = useSafeAreaInsets();
  const isConnected = useIsConnected();
  const appIsActive = useAppIsActive();

  useEffect(() => {
    if (appIsActive && isConnected) {
      navigation.goBack();
    }
  }, [appIsActive, isConnected]);

  return (
    <Stack flex={1} alignItems="center" paddingHorizontal={24} paddingBottom={bottom}>
      <Text fontSize={"$2"} color={"$primary"} textAlign="center">Discovering these amazing teams and creators on xLog!</Text>
      <MeasuredContainer flex={1}>
        {({ height }) => {
          return (
            <YStack flex={1} width={"100%"} marginVertical="$4">
              <Carousel<CharacterEntity>
                data={showcaseSites.data}
                width={ITEM_WIDTH}
                height={ITEM_HEIGHT}
                style={{
                  flex: 1,
                }}
                vertical
                enabled={false}
                autoPlay
                scrollAnimationDuration={700}
                withAnimation={{
                  type: "timing",
                  config: {
                    duration: 550,
                    easing: Easing.inOut(Easing.ease),
                  },
                }}
                windowSize={Math.fround(height / ITEM_HEIGHT) + 2}
                renderItem={({ item, index, animationValue }) => (
                  <CharacterCard
                    item={item}
                    index={index}
                    key={item.characterId}
                    parentLatyoutHeight={height}
                    animationValue={animationValue}
                  />
                )}
              />
            </YStack>
          );
        }}
      </MeasuredContainer>
      <ConnectionButton width={"100%"} marginBottom="$3"/>
      <Text color="$colorSubtitle" fontSize={"$3"}>
          By connecting you agree to our <Text onPress={navigateToTerms} color="$color" fontSize={"$3"}>Terms & Conditions</Text>
      </Text>
    </Stack>
  );
};

const CharacterCard: FC<{
  item: CharacterEntity
  index: number
  animationValue: Animated.SharedValue<number>
  parentLatyoutHeight: number
}> = (props) => {
  const { item, animationValue, index, parentLatyoutHeight } = props;
  const validItemLength = Math.max(Math.floor(parentLatyoutHeight / ITEM_HEIGHT) - 1, 2);
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
