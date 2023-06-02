import type { FC } from "react";
import React, { useEffect, useMemo } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withDelay } from "react-native-reanimated";

import { useCharacter, useNote } from "@crossbell/indexer";
import { UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Spacer, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { CommentButton } from "@/components/CommentButton";
import { ReactionLike } from "@/components/ReactionLike";
import { ReactionMint } from "@/components/ReactionMint";
import { ReportButton } from "@/components/ReportButton";
import { useColors } from "@/hooks/use-colors";
import { useFollow } from "@/hooks/use-follow";
import { useGetPage } from "@/queries/page";
import { getNoteSlug } from "@/utils/get-slug";

export interface Props {
  characterId: number
  noteId: number
  bottomBarHeight: number
}

export const BottomBar: FC<Props> = (props) => {
  const { characterId, noteId, bottomBarHeight } = props;
  const avatarSize = 30;
  const { backgroundFocus, primary } = useColors();
  const note = useNote(characterId, noteId);
  const character = useCharacter(characterId);
  const { isFollowing, isLoading, toggleSubscribe } = useFollow({ character: character?.data });

  const page = useGetPage(
    {
      characterId: character?.data?.characterId,
      slug: getNoteSlug(note.data),
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

  const followAnimValue = useSharedValue<number>(0);

  const reactionCommonProps = {
    characterId: note?.data?.characterId,
    noteId: note?.data?.noteId,
  };

  const followContainerAnimStyle = useAnimatedStyle(() => {
    return {
      paddingRight: interpolate(followAnimValue.value, [0, 1], [0, 10]),
      width: interpolate(followAnimValue.value, [0, 1], [avatarSize, avatarSize * 2 + 5]),
    };
  }, []);

  const subscribeAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(followAnimValue.value, [0, 0.3, 0.7, 1], [1, 0.7, 1.3, 1]),
        }, {
          rotateZ: `${interpolate(followAnimValue.value, [0, 0.3, 1], [0, 45, 0])}deg`,
        },
      ] as any,
      zIndex: 2,
    };
  }, []);

  const handleToggleSubscribe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSubscribe();
  };

  useEffect(() => {
    followAnimValue.value = withDelay(1500, withSpring(1));
  }, []);

  return (
    <XStack
      width={"100%"}
      bottom={0}
      position="absolute"
      backgroundColor={"$background"}
      height={bottomBarHeight}
      borderTopColor={"$borderColor"}
      borderTopWidth={1}
      paddingHorizontal={"$5"}
      paddingTop={"$1"}
    >
      <XStack width={"100%"} height={"$4"} justifyContent="space-between" alignItems="center">
        <Animated.View style={[followContainerAnimStyle, {
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 50,
          backgroundColor: isFollowing ? backgroundFocus : primary,
          flexDirection: "row",
          overflow: "hidden",
          borderColor: "white",
        }]} >
          <Avatar useDefault size={avatarSize} character={character.data} />
          <TouchableWithoutFeedback onPress={handleToggleSubscribe} hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }} >
            <Animated.View style={subscribeAnimStyle}>
              {
                isFollowing
                  ? (
                    <UserMinus width={16} disabled={isLoading} />
                  )
                  : (
                    <UserPlus size={16} disabled={isLoading}/>
                  )
              }
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
        <XStack alignItems="center">
          {
            !pageIsNotFound && (
              <>
                <ReactionLike {...reactionCommonProps} />
                <Spacer size="$4" />
                <ReactionMint {...reactionCommonProps} />
                <Spacer size="$4" />
                <CommentButton {...reactionCommonProps} />
                <Spacer size="$4" />
                <ReportButton/>
                {/* TODO */}
                {/* <ReactionTip {...reactionCommonProps} /> */}
              </>
            )
          }
        </XStack>
      </XStack>
    </XStack>
  );
};
