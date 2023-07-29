import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InteractionManager, StyleSheet } from "react-native";
import { FlatList, TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { MessageSquare } from "@tamagui/lucide-icons";
import type { ListResponse, NoteEntity } from "crossbell";
import * as Haptics from "expo-haptics";
import type { FontSizeTokens, SizeTokens } from "tamagui";
import { H4, SizableText, Spinner, Stack, Text, XStack, useWindowDimensions } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useNavigateToLogin } from "@/hooks/use-auth-press";
import { useColors } from "@/hooks/use-colors";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useSetupAnonymousComment } from "@/hooks/use-setup-anonymous-comment";
import { useGetComments, useSubmitComment } from "@/queries/page";
import { GA } from "@/utils/GA";

import { Button } from "./Base/Button";
import type { Comment } from "./CommentItem";
import { CommentItem } from "./CommentItem";
import { DelayedRender } from "./DelayRender";
import { FilledSpinner, WithSpinner } from "./WithSpinner";
import { XTouch } from "./XTouch";

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
  const [isLoading, setIsLoading] = useState(false);
  const i18n = useTranslation("site");
  const { anonymousCommentDialog, withAnonymousComment } = useSetupAnonymousComment();
  const isConnected = useIsConnected();
  const navigateToLogin = useNavigateToLogin();
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
  const snapPoints = useMemo(() => ["75%"], []);
  const _submitComment = useSubmitComment();
  const flatListRef = useRef<FlatList>(null!);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { background, color, subtitle, borderColor } = useColors();
  const gaWithScreenParams = useGAWithScreenParams();
  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
    comments.refetch();
    GA.logEvent("open_comment_sheet", gaWithScreenParams);
  };

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

  const login = () => {
    bottomSheetRef.current.close();
    navigateToLogin();
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
      { type: "header", data: null } as ItemData,
      ...comments.data?.pages.flatMap(page =>
        (page?.list || []).map(data => ({
          type: "data",
          data,
        })),
      ) as Array<ItemData>,
    ]
    : [];

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
          <WithSpinner isLoading={isLoading}>
            <Animated.View style={[styles.commentItemContainer]} entering={FadeIn.duration(250)}>
              <FlatList
                ref={flatListRef}
                contentContainerStyle={{
                  paddingBottom: bottom + 16,
                }}
                data={data}
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
                  if (item.type === "header") {
                    return (
                      <Stack backgroundColor={background} paddingBottom={8} marginBottom="$3">
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
                modalVisible
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
                        placeholder={
                          isEditing
                            ? selectedEditComment?.metadata?.content?.content
                            : i18n.t("Write a comment")
                        }
                        placeholderTextColor={subtitle}
                      />
                      <Button type={content ? "primary" : "disabled"} alignSelf="center" onPress={submitComment} alignItems="center" justifyContent="center">
                        {i18n.t("Publish")}
                      </Button>
                    </XStack>
                  )
                  : (
                    <XStack
                      width={width}
                      mih={90}
                      position="absolute"
                      paddingBottom={bottom}
                      paddingTop={8}
                      bottom={0}
                      left={0}
                      backgroundColor={"$background"}
                      paddingHorizontal="$3"
                      gap="$2"
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
                    </XStack>
                  )
              }
            </Animated.View>
          </WithSpinner>
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
