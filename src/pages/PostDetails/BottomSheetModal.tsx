import type { FC } from "react";
import React, { useEffect, useMemo, useRef } from "react";
import { InteractionManager, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useDerivedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCharacter, useNote } from "@crossbell/indexer";
import RNBottomSheet from "@gorhom/bottom-sheet";
import type { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { Image } from "expo-image";
import { Spacer, Stack, XStack } from "tamagui";

import { BlockchainInfoIcon } from "@/components/BlockchainInfoIcon";
import { CustomizedBackdrop } from "@/components/BottomSheetModal";
import { CommentButton } from "@/components/CommentButton";
import { ReactionLike } from "@/components/ReactionLike";
import { XTouch } from "@/components/XTouch";
import { useColors } from "@/hooks/use-colors";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useGetPage } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";
import { getNoteSlug } from "@/utils/get-slug";

import type { BottomSheetTabsInstance } from "./BottomSheetTabs";
import { BottomSheetTabs } from "./BottomSheetTabs";
import { bottomSheetPadding } from "./constants";

export interface Props {
  characterId: number
  bottomBarHeight: number
  note: ExpandedNote
}

export const BottomSheetModal: FC<Props> = (props) => {
  const { characterId, note, bottomBarHeight } = props;
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const bottomSheetTabsRef = useRef<BottomSheetTabsInstance>(null);
  const character = useCharacter(characterId);
  const { bottom } = useSafeAreaInsets();
  const { pick } = useColors();
  const snapPoints = useMemo(() => [75 + bottom, "85%"], [bottom]);
  const { isDarkMode } = useThemeStore();
  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note),
      useStat: true,
    },
  );

  const pageIsNotFound = useMemo(() => {
    if (page.isLoading || page.isError || !page.data) {
      return false;
    }

    return (new Date(page?.data?.metadata?.content?.date_published || "") > new Date()
    );
  }, [page]);

  const reactionCommonProps = {
    characterId: note?.characterId,
    noteId: note?.noteId,
  };

  const defaultBottomSheetModalIndex = -1;
  const bottomSheetModalAnimVal = useSharedValue(defaultBottomSheetModalIndex);

  const actionsAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetModalAnimVal.value,
        [0, 0.2],
        [1, 0],
        Extrapolate.CLAMP,
      ),
      top: interpolate(
        bottomSheetModalAnimVal.value,
        [0, 0.2],
        [0, -20],
        Extrapolate.CLAMP,
      ),
      height: interpolate(
        bottomSheetModalAnimVal.value,
        [0, 0.5],
        [bottomBarHeight, 0],
        Extrapolate.CLAMP,
      ),
    };
  });

  const statsAnimStyles = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        bottomSheetModalAnimVal.value,
        [0, 0.2],
        [0, 1],
        Extrapolate.CLAMP,
      ),
      top: interpolate(
        bottomSheetModalAnimVal.value,
        [0, 0.2],
        [23, 0],
        Extrapolate.CLAMP,
      ),
    };
  });

  const backdropAnimVal = useDerivedValue(() => {
    return interpolate(
      bottomSheetModalAnimVal.value,
      [0, 1],
      [-1, 0],
      Extrapolate.CLAMP,
    );
  });

  return (
    <RNBottomSheet
      ref={bottomSheetRef}
      animatedIndex={bottomSheetModalAnimVal}
      snapPoints={snapPoints}
      index={0}
      enablePanDownToClose={false}
      keyboardBehavior="interactive"
      activeOffsetY={[-10, 10]}
      keyboardBlurBehavior="restore"
      backdropComponent={props => (
        <CustomizedBackdrop {...props}
          animatedIndex={backdropAnimVal}
          onPress={() => bottomSheetRef.current.snapToIndex(0)}
        />
      )}
      style={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,

        ...isDarkMode
          ? {

          }
          : {
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
          },
      }}
      backgroundStyle={{ backgroundColor: pick("bottomSheetBackground") }}
      handleIndicatorStyle={styles.handleIndicatorStyle}
      backgroundComponent={props => (
        <Stack {...props} borderTopLeftRadius={16} borderTopRightRadius={16}>
          <Image contentFit="cover" source={require("../../assets/details-action-bg.png")} style={styles.actionsBg} />
        </Stack>
      )}
    >
      <Stack paddingHorizontal={bottomSheetPadding} width={"100%"}>
        <Animated.View style={actionsAnimStyles}>
          <XStack
            height={bottomBarHeight}
            paddingTop={"$1"}
          >
            <XStack width={"100%"} height={"$4"} justifyContent="space-between" alignItems="center">
              <XTouch enableHaptics onPress={() => {
                bottomSheetTabsRef.current?.setActivity(0);
                bottomSheetRef.current?.snapToIndex(1);
              }}>
                <BlockchainInfoIcon renderOnly/>
              </XTouch>
              <XStack alignItems="center">
                {
                  !pageIsNotFound && (
                    <>
                      <ReactionLike countShown={false} ga={{ type: "post" }} {...reactionCommonProps} />
                      <Spacer size="$4" />
                      <XTouch enableHaptics onPress={() => {
                        bottomSheetTabsRef.current?.setActivity(1);
                        bottomSheetRef.current?.snapToIndex(1);

                        InteractionManager.runAfterInteractions(() => {
                          bottomSheetTabsRef.current?.comment();
                        });
                      }}>
                        <CommentButton countShown={false} onlyRender {...reactionCommonProps} />
                      </XTouch>
                    </>
                  )
                }
              </XStack>
            </XStack>
          </XStack>
        </Animated.View>
      </Stack>

      <Animated.View style={[statsAnimStyles, { flex: 1 }]}>
        <BottomSheetTabs ref={bottomSheetTabsRef} note={page?.data}/>
      </Animated.View>
    </RNBottomSheet>
  );
};

const styles = StyleSheet.create({
  actionsBg: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "100%",
    height: "50%",
    opacity: 0.45,
  },
  handleIndicatorStyle: {
    backgroundColor: "#3A3A3A",
    width: 50,
    height: 4,
    borderRadius: 2,
  },
});
