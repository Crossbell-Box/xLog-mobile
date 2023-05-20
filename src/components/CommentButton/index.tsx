import React, { useMemo, useRef } from "react";
import { InteractionManager, StyleSheet } from "react-native";
import { FlatList, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MessageSquare } from "@tamagui/lucide-icons";
import type { ListResponse, NoteEntity } from "crossbell";
import type { FontSizeTokens, SizeTokens } from "tamagui";
import { H4, SizableText, Stack, XStack } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useColors } from "@/hooks/use-colors";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useGetComments } from "@/queries/page";

import type { Comment } from "../CommentItem";
import { CommentItem } from "../CommentItem";
import { DelayedRender } from "../DelayRender";
import { FilledSpinner } from "../WithSpinner";

interface Props {
  characterId: number
  noteId: number
  iconSize?: SizeTokens
  fontSize?: FontSizeTokens
}

type ItemData = {
  type: "header"
  data: null
} | {
  type: "data"
  data: NoteEntity & {
    fromNotes: ListResponse<NoteEntity>
  }
};

export const CommentButton: React.FC<Props> = ({ characterId, noteId, iconSize = "$1", fontSize = "$base" }) => {
  const comments = useGetComments({
    characterId,
    noteId,
  });
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const { background } = useColors();
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
    comments.refetch();
  };

  const navigation = useRootNavigation();
  const toRepliesPage = (comment: Comment) => {
    bottomSheetRef.current.close();

    InteractionManager.runAfterInteractions(() => {
      navigation.navigate("Replies", { comment });
    });
  };

  const commentsCount = comments.data?.pages?.[0]?.count || 0;

  return (
    <>
      <TouchableWithoutFeedback onPress={openBottomSheet} delayLongPress={150}>
        <XStack alignItems="center" gap="$1.5">
          <MessageSquare
            size={iconSize}
            color={"$color"}
          />
          <SizableText size={fontSize} color={"$color"}>
            {commentsCount}
          </SizableText>
        </XStack>
      </TouchableWithoutFeedback>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        backgroundStyle={{ backgroundColor: background }}
      >
        <DelayedRender timeout={100} placeholder={<FilledSpinner/>}>
          <Animated.View style={styles.commentItemContainer} entering={FadeIn.duration(250)}>
            <FlatList
              contentContainerStyle={{
                paddingBottom: bottom + 16,
              }}
              data={
                comments.data?.pages.length
                  ? [
                    { type: "header", data: null } as ItemData,
                    ...comments.data?.pages?.reduce((acc, page) => {
                      return acc.concat((page?.list || []).map((data) => {
                        return {
                          type: "data",
                          data,
                        };
                      }));
                    }, []) as Array<ItemData>,
                  ]
                  : []
              }
              showsVerticalScrollIndicator={false}
              stickyHeaderIndices={[0]}
              keyExtractor={(item) => {
                if (item.type === "header") {
                  return "header";
                }
                if (item.type === "data") {
                  return item.data.blockNumber.toString();
                }
                return "unknown";
              }}
              renderItem={(options) => {
                const { item } = options;
                if (item.type === "header") {
                  return (
                    <Stack backgroundColor={background} paddingBottom={8} marginBottom="$3">
                      <H4>评论 {commentsCount}</H4>
                    </Stack>
                  );
                }

                const comment = item.data;

                return (
                  <CommentItem
                    displayReply
                    displayMore={comment.fromNotes?.list?.length > 2}
                    padding={0}
                    comment={comment}
                    onPressMore={() => {
                      toRepliesPage(comment);
                    }}
                  />
                );
              }}
            />
          </Animated.View>
        </DelayedRender>
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  commentItemContainer: {
    flex: 1,
    padding: 16,
  },
});
