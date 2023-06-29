import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, StyleSheet } from "react-native";
import {
  Grayscale,
} from "react-native-color-matrix-image-filters";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { Easing, interpolate, interpolateColor, measure, runOnJS, runOnUI, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ContentLoader, { Circle } from "react-content-loader/native";
import { H3, Paragraph, SizableText, Stack, useWindowDimensions, YStack } from "tamagui";

import { useDate } from "@/hooks/use-date";
import type { AchievementSection } from "@/models/site.model";
import { toGateway } from "@/utils/ipfs-parser";

export interface AchievementItemProps {
  group: AchievementSection["groups"][number]
  layoutId: string
  size?: number
  characterId?: number
  isOwner: boolean
}

const animDuration = 300;

export const AchievementItem: React.FC<AchievementItemProps> = (props) => {
  const { group, isOwner, size = 100 } = props;
  const window = useWindowDimensions();
  const finalSize = Math.min(window.width * 0.8, window.height * 0.8);
  const safeAreaInsets = useSafeAreaInsets();
  const date = useDate();
  const i18n = useTranslation("common");

  const achievement = group.items
    .filter(item => item.status === "MINTED")
    .pop();

  const achievementMintable = isOwner
    ? group.items.filter(item => item.status === "MINTABLE").pop()
    : null;

  const achievementComing = isOwner
    ? group.items.filter(item => item.status === "COMING").pop()
    : null;

  const [opened, setOpened] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const initialStatus = useSharedValue<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const originalImgRef = useAnimatedRef<Animated.View>();
  const openedAnimValue = useSharedValue<number>(0);

  const topAnimValue = useDerivedValue(() => {
    const { top, bottom } = safeAreaInsets;
    const centerTop = (window.height - top - bottom) / 2 - finalSize / 2;

    return interpolate(openedAnimValue.value, [0, 0.1, 1], [initialStatus.value.y, initialStatus.value.y, centerTop]);
  }, [window, safeAreaInsets, finalSize]);

  const leftAnimValue = useDerivedValue(() => {
    const { left, right } = safeAreaInsets;
    const centerLeft = (window.width - left - right) / 2 - finalSize / 2;

    return interpolate(openedAnimValue.value, [0, 0.1, 1], [initialStatus.value.x, initialStatus.value.x, centerLeft]);
  }, [window, safeAreaInsets, finalSize]);

  const imgPosAnimStyles = useAnimatedStyle(() => {
    return {
      position: "absolute",
      top: topAnimValue.value,
      left: leftAnimValue.value,
    };
  }, []);

  const imgSizeAnimStyles = useAnimatedStyle(() => {
    return {
      width: interpolate(openedAnimValue.value, [0, 0.1, 1], [initialStatus.value.width, initialStatus.value.width, finalSize]),
      height: interpolate(openedAnimValue.value, [0, 0.1, 1], [initialStatus.value.height, initialStatus.value.height, finalSize]),
    };
  }, [finalSize]);

  const descriptionAnimStyles = useAnimatedStyle(() => {
    const { top, bottom } = safeAreaInsets;
    const centerTop = (window.height - top - bottom) / 2 + finalSize / 2 + 28; // 28 is an offset

    const { left, right } = safeAreaInsets;
    const centerLeft = (window.width - left - right) / 2 - finalSize / 2;

    const width = window.width * 0.8;

    return {
      top: interpolate(openedAnimValue.value, [0, 0.1, 1], [initialStatus.value.y, centerTop - 30, centerTop]),
      left: centerLeft,
      width,
      opacity: interpolate(openedAnimValue.value, [0, 0.1, 1], [0, 0, 1]),
    };
  }, [finalSize]);

  const backdropAnimStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(openedAnimValue.value, [0, 1], ["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]),
    };
  }, []);

  const originalImgAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(openedAnimValue.value, [0.1, 0.2], [1, 0]),
    };
  }, []);

  const openHandler = () => {
    "worklet";

    const measured = measure(originalImgRef);

    initialStatus.value = {
      x: measured.pageX,
      y: measured.pageY,
      width: measured.width,
      height: measured.height,
    };

    runOnJS(setOpened)(true);

    openedAnimValue.value = withTiming(1, { duration: animDuration, easing: Easing.in(Easing.ease) });
  };

  const closeHandler = () => {
    openedAnimValue.value = withTiming(0, { duration: animDuration, easing: Easing.out(Easing.ease) }, () => {
      runOnJS(setOpened)(false);
    });
  };

  if (isOwner) {
    if (!achievement && !achievementMintable && !achievementComing) {
      return null;
    }
  }
  else {
    if (!achievement) {
      return null;
    }
  }

  const media = (achievement || achievementMintable || achievementComing)!.info.media;

  return (
    <Stack width={size} height={size}>
      <TouchableWithoutFeedback onPress={() => runOnUI(openHandler)()} style={{ borderRadius: 50 }}>
        {
          achievement
            ? (
              <Animated.View ref={originalImgRef} style={originalImgAnimStyles}>
                <Animated.Image onLoad={() => setLoaded(true)} source={{ uri: toGateway(media) }} style={{ width: size, height: size }} />
              </Animated.View>
            )
            : (
              <Animated.View ref={originalImgRef} style={originalImgAnimStyles}>
                <Grayscale style={{ width: size, height: size }}>
                  <Animated.Image onLoad={() => setLoaded(true)} source={{ uri: toGateway(media) }} style={{ width: size, height: size }} />
                </Grayscale>
              </Animated.View>
            )
        }
      </TouchableWithoutFeedback>
      {
        !loaded && (
          <ContentLoader
            viewBox={`0 0 ${size} ${size}`}
            backgroundColor={"gray"}
            opacity="0.3"
            style={{ position: "absolute" }}
          >
            <Circle cx={size / 2} cy={size / 2} r={size / 2} />
          </ContentLoader>
        )
      }
      {
        opened && (
          <Modal visible transparent>
            <Animated.View style={[StyleSheet.absoluteFill, backdropAnimStyles]}>
              <YStack justifyContent="center">
                <Animated.View style={[imgPosAnimStyles, imgSizeAnimStyles]}>
                  <TouchableWithoutFeedback onPress={closeHandler}>
                    <Animated.Image source={{ uri: toGateway(media) }} style={imgSizeAnimStyles} />
                    {/* // TODO: Using <Grayscale> will flash */}
                    {/* {
                    achievement
                    ? <Animated.Image source={{ uri: toGateway(media) }} style={imgSizeAnimStyles} />
                    : (
                      <Grayscale>
                      <Animated.Image source={{ uri: toGateway(media) }} style={imgSizeAnimStyles} />
                      </Grayscale>
                      )
                    } */}
                  </TouchableWithoutFeedback>
                </Animated.View>
                <Animated.View style={[descriptionAnimStyles, styles.description]}>
                  <H3>{group.info.title} {achievement && `#${achievement.tokenId}`}</H3>
                  <SizableText textAlign="center" color="$colorDescription">
                    {
                      (achievement || achievementMintable || achievementComing)!.info
                        .description
                    }
                  </SizableText>
                  <Paragraph color={"$colorSubtitle"}>
                    {achievement
                      ? i18n.t("ago", {
                        time: date.dayjs
                          .duration(
                            date
                              .dayjs(achievement.mintedAt)
                              .diff(date.dayjs(), "minute"),
                            "minute",
                          )
                          .humanize(),
                      })
                      : i18n.t(achievementMintable ? "Mintable" : "Coming soon")}
                  </Paragraph>
                </Animated.View>
              </YStack>
            </Animated.View>
          </Modal>
        )
      }
    </Stack >
  );
};

const styles = StyleSheet.create({
  description: {
    justifyContent: "center",
    alignItems: "center",
  },
});
