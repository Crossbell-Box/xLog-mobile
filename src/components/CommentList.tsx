import type { FC } from "react";
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet, FlatList as RNFlatList, TextInput as RNTextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import type { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import { BottomSheetFlatList, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { SizableText, Spacer, Spinner, Stack, Text, XStack, YStack, useWindowDimensions } from "tamagui";

import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { IS_IOS } from "@/constants";
import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useColors } from "@/hooks/use-colors";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useIsLogin } from "@/hooks/use-is-login";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useSetupAnonymousComment } from "@/hooks/use-setup-anonymous-comment";
import { useGetComments, useSubmitComment } from "@/queries/page";
import { GA } from "@/utils/GA";

import { Button } from "./Base/Button";
import type { Comment } from "./CommentItem";
import { CommentItem } from "./CommentItem";
import { FillSpinner } from "./FillSpinner";
import { ReactionLike } from "./ReactionLike";
import { ReportButton } from "./ReportButton";

interface Props {
  characterId: number
  noteId: number
  couldComment?: boolean
  isInBottomSheet?: boolean
}

export interface CommentListInstance {
  comment: () => void
}

export const CommentList = forwardRef<CommentListInstance, Props>((
  { characterId, noteId, couldComment, isInBottomSheet },
  ref,
) => {
  const comments = useGetComments({ characterId, noteId });
  const { show, hide } = useGlobalLoading();
  const i18n = useTranslation("site");
  const { withAnonymousComment, anonymousCommentDialog } = useSetupAnonymousComment();
  const isLogin = useIsLogin();
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
  const { color, subtitle, borderColor } = useColors();
  const gaWithScreenParams = useGAWithScreenParams();

  const navigation = useRootNavigation();

  const toRepliesPage = (comment: Comment, depth: number) => {
    bottomSheetRef.current.close();

    InteractionManager.runAfterInteractions(() => {
      navigation.navigate("Replies", { comment, depth });
    });
  };

  const displayInput = () => {
    setModalVisible(true);
  };

  const hideInput = () => {
    setModalVisible(false);
    setContent("");
  };

  const submitComment = withAnonymousComment(async () => {
    show();
    GA.logEvent("submit_comment", gaWithScreenParams);

    return _submitComment({
      characterId: selectedComment.characterId,
      noteId: selectedComment.noteId,
      originalCharacterId: isEditing ? selectedEditComment.characterId : characterId,
      originalNoteId: isEditing ? selectedEditComment.noteId : noteId,
      content,
      comment: isEditing ? selectedEditComment : undefined,
      anonymous: !isLogin,
    })
      .then(() => comments.refetch())
      .finally(() => {
        hide();
        hideInput();
        typeof selectedIndex === "number" && scrollToIndex(selectedIndex);
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

  const data = useMemo(() => (
    comments.data?.pages.flatMap(page => page?.list.map(data => data) || [])
  ), [comments.data?.pages]);

  useImperativeHandle(ref, () => ({
    comment: onPressInput,
  }));

  const FlatList = isInBottomSheet ? BottomSheetFlatList : RNFlatList;
  const TextInput = isInBottomSheet ? BottomSheetTextInput : RNTextInput;

  return (
    <Stack flex={1}>
      {anonymousCommentDialog}
      <FlatList
        ref={flatListRef}
        contentContainerStyle={{
          paddingBottom: bottom + 16,
        }}
        data={data}
        style={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (
            !comments.data
        || comments.isFetchingNextPage
        || comments.hasNextPage === false
          )
            return;

          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          comments?.fetchNextPage?.();
        }}
        ListFooterComponent={comments.isFetchingNextPage && <Spinner paddingVertical="$5"/>}
        ListEmptyComponent={<EmptyComponent isLoading={comments.isFetching}/>}
        keyExtractor={item => item.blockNumber?.toString()}
        renderItem={(options) => {
          const comment = options.item;
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
          <Stack height={modalVisible && IS_IOS ? 60 - bottom : 60}>
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
                    height={40}
                  >
                    <TextInput
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
                    <Button
                      backgroundColor={"transparent"}
                      type={content ? "primary" : "disabled"}
                      alignSelf="center"
                      onPress={submitComment}
                      alignItems="center"
                      justifyContent="center"
                      height={40}
                    >
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
                          isLogin
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
    </Stack>
  );
});

export const EmptyComponent: FC<{
  isLoading: boolean
  creationTipsShown?: boolean
  onPressCreationTips?: () => void
}> = ({ isLoading, creationTipsShown, onPressCreationTips }) => {
  const i18n = useTranslation("common");
  return (
    <Stack height={300}>
      {
        isLoading
          ? <FillSpinner/>
          : (
            <YStack minHeight={300} alignItems="center" justifyContent="center" gap="$2">
              <Image
                source={require("../assets/comment-list-empty.png")}
                style={{ width: 100, height: 100 }}
                contentFit="contain"
              />
              <SizableText color={"$colorUnActive"} size="$5">
                {i18n.t("There are no comments yet.")}
              </SizableText>
              {
                creationTipsShown && (
                  <>
                    <Spacer/>
                    <Button type="primary" onPress={onPressCreationTips}>
                      {i18n.t("Add a comment")}
                    </Button>
                  </>
                )
              }
            </YStack>
          )
      }
    </Stack>

  );
};

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
