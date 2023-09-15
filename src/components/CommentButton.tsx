import React, { useMemo, useRef } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

import { MessageSquare } from "@tamagui/lucide-icons";
import type { FontSizeTokens, SizeTokens } from "tamagui";
import { SizableText, XStack } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useColors } from "@/hooks/use-colors";
import { useSetupAnonymousComment } from "@/hooks/use-setup-anonymous-comment";
import { useGetComments } from "@/queries/page";
import { GA } from "@/utils/GA";

import { CommentList } from "./CommentList";
import { DelayedRender } from "./DelayRender";
import { FilledSpinner } from "./WithSpinner";
import { XTouch } from "./XTouch";

interface Props {
  characterId: number
  noteId: number
  iconSize?: SizeTokens
  fontSize?: FontSizeTokens
  onlyRender?: boolean
  countShown?: boolean
}

export const CommentButton: React.FC<Props> = ({
  characterId,
  onlyRender = false,
  countShown = true,
  noteId,
  iconSize = "$1",
  fontSize = "$6",
}) => {
  const comments = useGetComments({ characterId, noteId });
  const { anonymousCommentDialog } = useSetupAnonymousComment();
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const { background } = useColors();
  const gaWithScreenParams = useGAWithScreenParams();
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
    comments.refetch();
    GA.logEvent("open_comment_sheet", gaWithScreenParams);
  };

  const commentsCount = comments.data?.pages?.[0]?.count || 0;

  if (onlyRender) {
    return (
      <XStack alignItems="center" gap="$1.5">
        <MessageSquare
          size={iconSize}
          color={"$color"}
        />
        {countShown && (
          <SizableText size={fontSize} color={"$color"}>
            {commentsCount}
          </SizableText>
        )}
      </XStack>
    );
  }

  return (
    <>
      <XTouch enableHaptics hitSlopSize={44} touchableComponent={TouchableWithoutFeedback} onPress={openBottomSheet} delayLongPress={150}>
        <XStack alignItems="center" gap="$1.5">
          <MessageSquare
            size={iconSize}
            color={"$color"}
          />
          <SizableText size={fontSize} color={"$color"}>
            {commentsCount}
          </SizableText>
        </XStack>
      </XTouch>

      {anonymousCommentDialog}

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: background }}
      >
        <DelayedRender timeout={100} placeholder={<FilledSpinner />}>
          <CommentList isInBottomSheet noteId={noteId} characterId={characterId} />
        </DelayedRender>
      </BottomSheetModal>
    </>
  );
};
