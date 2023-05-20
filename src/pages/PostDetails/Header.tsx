import type { FC } from "react";
import React from "react";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import Animated, { interpolate, useAnimatedStyle, interpolateColor } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { H4, XStack } from "tamagui";

import { BlockchainInfoIcon } from "@/components/BlockchainInfoIcon";
import { useColors } from "@/hooks/use-colors";
import { useGetPage } from "@/queries/page";
import { useGetSite } from "@/queries/site";
import { getNoteSlug } from "@/utils/get-slug";

export interface Props {
  isExpandedAnimValue: SharedValue<0 | 1>
  characterId: number
  noteId: number
  headerContainerHeight: number
}

export const Header: FC<Props> = (props) => {
  const { isExpandedAnimValue, characterId, noteId, headerContainerHeight } = props;
  const { goBack } = useNavigation();
  const { background, backgroundFocus, primary } = useColors();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const site = useGetSite(character.data?.handle);

  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note.data),
      useStat: true,
    },
  );

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

  return (
    <Animated.View style={[{
      paddingTop: top + 5,
      height: headerHeight,
      width: "100%",
      position: "absolute",
      zIndex: 2,
    }, headerBgAnimStyles]}>
      <TouchableWithoutFeedback onPress={goBack} containerStyle={{
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
        <BlockchainInfoIcon page={page?.data} character={site?.data}/>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
