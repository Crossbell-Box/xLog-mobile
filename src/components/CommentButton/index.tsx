import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, KeyboardAvoidingView, StyleSheet } from "react-native";
import { FlatList, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useNote } from "@crossbell/indexer";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { MessageSquare } from "@tamagui/lucide-icons";
import type { ListResponse, NoteEntity } from "crossbell";
import type { FontSizeTokens, SizeTokens } from "tamagui";
import { Button, H4, Input, SizableText, Spinner, Stack, Text, XStack, YStack, useWindowDimensions } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { isIOS } from "@/constants/platform";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useCommentPage, useGetComments, useUpdateComment } from "@/queries/page";

import type { Comment } from "../CommentItem";
import { CommentItem } from "../CommentItem";
import { DelayedRender } from "../DelayRender";
import { FilledSpinner, WithSpinner } from "../WithSpinner";

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

export const CommentButton: React.FC<Props> = ({ characterId, noteId, iconSize = "$1", fontSize = "$6" }) => {
  const comments = useGetComments({ characterId, noteId });
  const [isLoading, setIsLoading] = React.useState(false);
  const { t } = useTranslation("site");
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [content, setContent] = React.useState("");
  const [selectedComment, setSelectedComment] = React.useState<Comment | null>(null);
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const snapPoints = useMemo(() => ["70%"], []);
  const commentPage = useCommentPage();
  const updateComment = useUpdateComment();
  const [isEditing, setIsEditing] = React.useState(false);
  const { background, color, subtitle, borderColor } = useColors();
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

  const displayInput = () => {
    setIsEditing(true);
  };

  const hideInput = () => {
    setIsEditing(false);
    setContent("");
    setSelectedComment(null);
  };

  const submitComment = async () => {
    try {
      if (characterId && noteId) {
        if (selectedComment) {
          if (content) {
            setIsLoading(true);
            await updateComment.mutate({
              content,
              externalUrl: window.location.href,
              characterId: selectedComment.characterId,
              noteId: selectedComment.noteId,
              originalCharacterId: characterId,
              originalNoteId: noteId,
            });
          }
        }
        else {
          setIsLoading(true);
          await commentPage.mutate({
            characterId,
            noteId,
            content,
            externalUrl: window.location.href,
            originalCharacterId: characterId,
            originalNoteId: noteId,
          });
        }
      }
    }
    catch (e) {
      console.error(e);
    }
    finally {
      setIsLoading(false);
    }
  };

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
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backgroundStyle={{ backgroundColor: background }}
      >
        <DelayedRender timeout={100} placeholder={<FilledSpinner/>}>
          <Animated.View style={[styles.commentItemContainer]} entering={FadeIn.duration(250)}>
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
                    onPressComment={(comment) => {
                      setSelectedComment(comment);
                      displayInput();
                    }}
                    onPressMore={() => {
                      toRepliesPage(comment);
                    }}
                  />
                );
              }}
            />
            {
              isEditing
                ? (
                  <XStack
                    width={width}
                    position="absolute"
                    paddingBottom={8}
                    paddingTop={8}
                    bottom={0}
                    left={0}
                    backgroundColor={"$background"}
                    paddingHorizontal="$3"
                    gap="$2"
                  >
                    <BottomSheetTextInput
                      style={[{ borderColor, color }, styles.input]}
                      multiline
                      onBlur={hideInput}
                      autoFocus
                      onChangeText={setContent}
                      placeholder={t("Write a comment on the blockchain")}
                      placeholderTextColor={subtitle}
                    />
                    <Button alignSelf="center" onPress={submitComment} alignItems="center" justifyContent="center">
                      {isLoading ? <Spinner/> : "发布"}
                    </Button>
                  </XStack>
                )
                : (
                  <XStack
                    width={width}
                    position="absolute"
                    paddingBottom={bottom}
                    paddingTop={8}
                    bottom={0}
                    left={0}
                    backgroundColor={"$background"}
                    paddingHorizontal="$3"
                  >
                    <XStack paddingHorizontal={12} height={40} borderWidth={1} borderRadius={10} borderColor={"$borderColor"} alignItems="center" space="$2" flex={1} onPress={displayInput}>
                      <Text flex={1} borderWidth={1} borderRadius={10} color={"$colorSubtitle"}>
                        {t("Write a comment on the blockchain")}
                      </Text>
                    </XStack>
                  </XStack>
                )
            }
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
  input: {
    borderWidth: 1,
    flex: 1,
    borderRadius: 10,
    padding: 12,
    paddingTop: 12,
  },
});
