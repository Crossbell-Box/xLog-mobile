import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import type { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { H4, Spinner, Stack, Text, XStack, useWindowDimensions } from "tamagui";

import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useColors } from "@/hooks/use-colors";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useSetupAnonymousComment } from "@/hooks/use-setup-anonymous-comment";
import { useGetComments, useSubmitComment } from "@/queries/page";
import type { ExpandedNote } from "@/types/crossbell";
import { GA } from "@/utils/GA";

import { Button } from "./Base/Button";
import type { Comment } from "./CommentItem";
import { CommentItem } from "./CommentItem";
import { ReactionLike } from "./ReactionLike";
import { ReportButton } from "./ReportButton";
import { WithSpinner } from "./WithSpinner";

interface Props {
  characterId: number
  noteId: number
  couldComment?: boolean
  headerShown?: boolean
}

type ItemData = {
  type: "header"
  data: null
} | {
  type: "data"
  data: ExpandedNote
};

export interface CommentListInstance {
  comment: () => void
}

export const CommentList = forwardRef<CommentListInstance, Props>((
  { characterId, noteId, couldComment, headerShown },
  ref,
) => {
  const comments = useGetComments({ characterId, noteId });
  const [isLoading, setIsLoading] = useState(false);
  const i18n = useTranslation("site");
  const { withAnonymousComment } = useSetupAnonymousComment();
  const isConnected = useIsConnected();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [content, setContent] = useState("");
  const [selectedComment, setSelectedComment] = useState<{
    characterId: number
    noteId: number
  }>(null);
  const [selectedEditComment, setSelectedEditComment] = useState<Comment | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const _submitComment = useSubmitComment();
  const flatListRef = useRef<BottomSheetFlatListMethods>(null!);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { background, color, subtitle, borderColor } = useColors();
  const gaWithScreenParams = useGAWithScreenParams();

  const navigation = useRootNavigation();

  const toRepliesPage = (comment: Comment, depth: number) => {
    bottomSheetRef.current.close();

    InteractionManager.runAfterInteractions(() => {
      navigation.navigate("Replies", { comment, depth });
    });
  };

  const commentsCount = comments.data?.pages?.[0]?.count || 0;

  const displayInput = () => {
    setModalVisible(true);
  };

  const hideInput = () => {
    setModalVisible(false);
    setContent("");
  };

  const submitComment = withAnonymousComment(() => {
    setIsLoading(true);
    GA.logEvent("submit_comment", gaWithScreenParams);

    return _submitComment({
      characterId: selectedComment.characterId,
      noteId: selectedComment.noteId,
      originalCharacterId: isEditing ? selectedEditComment.characterId : characterId,
      originalNoteId: isEditing ? selectedEditComment.noteId : noteId,
      content,
      comment: isEditing ? selectedEditComment : undefined,
      anonymous: !isConnected,
    })
      .then(() => comments.refetch())
      .finally(() => {
        setIsLoading(false);
        hideInput();
        scrollToIndex(selectedIndex);
      });
  });

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      viewOffset: 50,
    });
  };

  const onPressInput = () => {
    setIsEditing(false);
    setSelectedComment({
      characterId,
      noteId,
    });
    setSelectedIndex(0);
    displayInput();
  };

  const data = comments.data?.pages.length
    ? [
      headerShown ? { type: "header", data: null } as ItemData : undefined,
      ...comments.data?.pages.flatMap(page =>
        (page?.list || []).map(data => ({
          type: "data",
          data,
        })),
      ) as Array<ItemData>,
    ]
    : [];

  useImperativeHandle(ref, () => ({
    comment: onPressInput,
  }));

  return (
    <WithSpinner isLoading={isLoading}>
      <BottomSheetFlatList
        ref={flatListRef}
        contentContainerStyle={{
          paddingBottom: bottom + 16,
        }}
        data={data}
        style={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (
            comments.data?.pages.length === 0
        || comments.isFetchingNextPage
        || comments.hasNextPage === false
          )
            return;

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          comments?.fetchNextPage?.();
        }}
        ListFooterComponent={(comments.isFetchingNextPage || (comments.isFetching && data.length === 0)) && <Spinner paddingBottom="$5" />}
        keyExtractor={(item) => {
          if (!item) {
            return "unknown";
          }

          if (item.type === "header") {
            return "header";
          }
          if (item.type === "data") {
            return item.data.blockNumber.toString();
          }
          return "unknown";
        }}
        renderItem={(options) => {
          const item = options.item as ItemData;

          if (!item) {
            return null;
          }

          if (item.type === "header") {
            return (
              <Stack paddingBottom={8} marginBottom="$3">
                <H4>{i18n.t("Comments")} {commentsCount}</H4>
              </Stack>
            );
          }

          const comment = item.data;
          const depth = 0;

          return (
            <CommentItem
              displayReply
              padding={0}
              comment={comment}
              depth={depth}
              onPressEdit={(comment) => {
                setIsEditing(true);
                setSelectedEditComment(comment);
                setSelectedIndex(options.index);
                displayInput();
              }}
              onPressComment={(comment) => {
                setIsEditing(false);
                setSelectedComment({
                  characterId: comment.characterId,
                  noteId: comment.noteId,
                });
                setSelectedIndex(options.index);
                displayInput();
              }}
              onPressMore={() => {
                toRepliesPage(comment, depth);
              }}
              onComment={comments.refetch}
              onEdit={comments.refetch}
            />
          );
        }}
      />

      {
        couldComment && (
          <Stack height={bottom + 60}>
            {
              modalVisible
                ? (
                  <XStack
                    width={width}
                    position="absolute"
                    top={0}
                    left={0}
                    paddingHorizontal="$3"
                    gap="$2"
                    height={50}
                  >
                    <BottomSheetTextInput
                      style={[{ borderColor, color }, styles.input]}
                      multiline
                      onBlur={hideInput}
                      autoFocus
                      onChangeText={setContent}
                      placeholder={
                        isEditing
                          ? selectedEditComment?.metadata?.content?.content
                          : i18n.t("Write a comment")
                      }
                      placeholderTextColor={subtitle}
                    />
                    <Button backgroundColor={"#1c1c1c"} type={content ? "primary" : "disabled"} alignSelf="center" onPress={submitComment} alignItems="center" justifyContent="center">
                      {i18n.t("Publish")}
                    </Button>
                  </XStack>
                )
                : (
                  <XStack
                    width={width}
                    position="absolute"
                    paddingHorizontal="$3"
                    gap="$2"
                    alignItems="center"
                    height={50}
                  >
                    <XStack
                      paddingHorizontal={12}
                      h={"100%"}
                      borderWidth={1}
                      borderRadius={10}
                      borderColor={"$borderColor"}
                      alignItems="center"
                      space="$2"
                      flex={1}
                      onPress={onPressInput}
                    >
                      <Text fontSize={"$5"} flex={1} borderRadius={10} color={"$colorSubtitle"}>
                        {
                          isConnected
                            ? i18n.t("Write a comment")
                            : i18n.t("Write a anonymous comment")
                        }
                      </Text>
                    </XStack>
                    <XStack paddingHorizontal="$2" gap="$3">
                      <ReactionLike
                        ga={{ type: "post" }}
                        characterId={characterId}
                        noteId={noteId}
                        countShown={false}
                        iconSize={24}
                      />
                      <ReportButton
                        iconSize={24}
                      />
                    </XStack>
                  </XStack>
                )
            }
          </Stack>
        )
      }
    </WithSpinner>
  );
});

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    flex: 1,
    borderRadius: 10,
    padding: 12,
    paddingTop: 12,
    fontSize: 16,
  },
});

