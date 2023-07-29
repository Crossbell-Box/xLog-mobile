import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TextInput } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import { useIsConnected } from "@crossbell/react-account";
import { ArrowRight, Edit } from "@tamagui/lucide-icons";
import type { ListResponse, NoteEntity } from "crossbell";
import type { ListItemProps } from "tamagui";
import { Text, XStack, YStack, Stack, Spacer, Paragraph, Button, Input } from "tamagui";

import { useGAWithScreenParams } from "@/hooks/ga/use-ga-with-screen-name-params";
import { useCharacterId } from "@/hooks/use-character-id";
import { useColors } from "@/hooks/use-colors";
import { useDate } from "@/hooks/use-date";
import { useGlobalLoading } from "@/hooks/use-global-loading";
import { useSetupAnonymousComment } from "@/hooks/use-setup-anonymous-comment";
import { useGetComments, useSubmitComment } from "@/queries/page";
import { flatComments } from "@/utils/flat-comments";
import { GA } from "@/utils/GA";

import { Avatar } from "./Avatar";
import { BlockchainInfoIcon } from "./BlockchainInfoIcon";
import { DelayedRender } from "./DelayRender";
import { KeyboardAvoidingView } from "./KeyboardAvoidingView";
import { ReactionLike } from "./ReactionLike";
import { Titles } from "./Titles";

export interface CommentItemProps extends ListItemProps {
  comment: Comment
  displayReply?: boolean
  depth?: number
  commentable?: boolean
  editable?: boolean
  originalCharacterId?: number
  originalNoteId?: number
  onPressMore?: () => void
  onPressComment?: (comment: Comment) => void
  onPressEdit?: (comment: Comment) => void
  onComment?: () => Promise<any>
  onEdit?: () => Promise<any>
}

export type Comment = NoteEntity & {
  fromNotes: ListResponse<NoteEntity>
};

export const CommentItem: React.FC<CommentItemProps> = (props) => {
  const {
    comment,
    displayReply = false,
    depth = 0,
    commentable = false,
    editable = false,
    originalCharacterId,
    originalNoteId,
    onPressMore,
    onPressComment: _onPressComment,
    onPressEdit: _onPressEdit,
    onComment,
    onEdit,
    ...restProps
  } = props;
  const date = useDate();
  const myCharacterId = useCharacterId();
  const isConnected = useIsConnected();
  const comments = useGetComments({ characterId: comment?.characterId, noteId: comment?.noteId });
  const commonI18n = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const toCharacterId = comment.toCharacterId;
  const toCharacter = useCharacter(toCharacterId);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { color, subtitle, borderColor } = useColors();
  const [content, setContent] = useState("");
  const _submitComment = useSubmitComment();
  const { show, hide } = useGlobalLoading();
  const { anonymousCommentDialog, withAnonymousComment } = useSetupAnonymousComment();
  const gaWithScreenParams = useGAWithScreenParams();
  const isAuthor = comment?.characterId === myCharacterId;
  const repliesCount = comments.data?.pages?.[0]?.count;
  const isSubComment = depth > 0;

  const onPressComment = React.useCallback(() => {
    if (commentable) {
      setIsEditing(false);
      openModal();
      return;
    }
    _onPressComment?.(comment);
  }, [_onPressComment, comment, commentable]);

  const onPressEdit = React.useCallback(() => {
    if (editable) {
      setIsEditing(true);
      openModal();
      return;
    }
    _onPressEdit?.(comment);
  }, [_onPressEdit, comment, editable]);

  const openModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    inputRef.current?.blur();
    setModalVisible(false);
  }, []);

  const submitComment = withAnonymousComment(async () => {
    closeModal();
    await new Promise(resolve => setTimeout(resolve, 500));
    show();
    GA.logEvent("submit_reply", gaWithScreenParams);
    return _submitComment({
      characterId: comment?.characterId,
      noteId: comment?.noteId,
      originalCharacterId: comment?.characterId,
      originalNoteId: comment?.noteId,
      content,
      comment: isEditing ? comment : undefined,
      anonymous: !isConnected,
    })
      .then(isEditing ? onEdit : onComment)
      .finally(() => {
        hide();
        setContent("");
      });
  });

  const flattedComments = useMemo(() => flatComments(
    comment?.fromNotes?.list?.length ? comment : undefined,
    1,
  )?.sort((a, b) => b?.data?.createdAt > a?.data?.createdAt ? 1 : -1), [comment]);

  const splitComments = useMemo(() => displayReply ? flattedComments?.slice(0, 2) : [], [displayReply, flattedComments]);
  const displayMore = useMemo(() => flattedComments?.length > 2, [flattedComments]);

  return (
    <>
      {anonymousCommentDialog}
      <XStack marginBottom="$2" gap="$3" {...restProps}>
        <Avatar useDefault size={isSubComment ? 36 : 40} character={comment?.character} />
        <YStack flex={1}>
          <YStack flex={1}>
            <XStack alignItems="center" marginBottom="$1">
              <Text fontWeight={isSubComment ? "400" : "700"} maxWidth={"40%"} numberOfLines={1}>
                {comment?.character?.metadata?.content?.name}
                {/*  {comment?.characterId}-{comment?.noteId} */}
              </Text>
              <Spacer size={2} />
              <Titles characterId={comment?.characterId} />

              {
                toCharacter?.data && (
                  <>
                    <Spacer size={4} />
                    <ArrowRight size={"$0.5"} color="$primary"/>
                    <Spacer size={4} />

                    <Text fontWeight={"400"} maxWidth={"40%"} numberOfLines={1}>
                      {toCharacter?.data?.metadata?.content?.name}
                      {/* {comment.toCharacterId}-{comment.toNoteId} */}
                    </Text>
                    <Spacer size={2} />
                    <Titles characterId={toCharacter?.data?.characterId} />
                  </>
                )
              }
            </XStack>

            <Paragraph size={"$4"}>
              {comment?.metadata?.content?.content}
            </Paragraph>
            <XStack alignItems="center">
              <Text color={"$colorSubtitle"}>
                {commonI18n.t("ago", {
                  time: date.dayjs
                    .duration(
                      date.dayjs(comment?.createdAt).diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })}
                {" · "}
              </Text>
              <Stack height={22} alignItems="center">
                <BlockchainInfoIcon size={16} character={comment?.character} page={comment?.toNote}/>
              </Stack>
            </XStack>
          </YStack>

          <XStack justifyContent="flex-end" gap="$3" marginTop="$2" alignItems="center">
            <ReactionLike ga={{ type: "reply" }} iconSize={"$0.75"} fontSize={"$4"} characterId={comment?.characterId} noteId={comment?.noteId}/>
            {
              depth < 2 && commentable && (
                <TouchableOpacity onPress={onPressComment}>
                  <XStack alignItems="center" gap="$1.5" minWidth={"$3"}justifyContent="center">
                    <Text color={"$color"} fontSize={"$4"}>
                      {commonI18n.t("Reply")}&nbsp;
                      {(comment as any)?.fromNotes?.count || 0}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )
            }
            {
              isAuthor && editable && (
                <TouchableOpacity onPress={onPressEdit}>
                  <XStack alignItems="center" gap="$1.5" minWidth={"$3"} justifyContent="center">
                    <Edit size={"$0.75"} fontSize={"$4"}/>
                    <Text color={"$color"} fontSize={"$4"}>
                    &nbsp;{commonI18n.t("Edit")}
                    </Text>
                  </XStack>
                </TouchableOpacity>
              )
            }
          </XStack>

          {
            splitComments.length > 0 && (
              <Stack marginTop="$3">
                {
                  splitComments?.map(
                    ({ depth, data }) => {
                      return (
                        <Stack key={data?.blockNumber} marginBottom="$2">
                          <CommentItem
                            editable={editable}
                            commentable={commentable}
                            comment={data}
                            onPressComment={_onPressComment}
                            displayReply={false}
                            depth={depth}
                          />
                        </Stack>
                      );
                    },
                  )
                }

                {
                  displayMore && (
                    <Button onPress={onPressMore} marginBottom="$4">
                      <Text>
                  查看全部{repliesCount}条回复
                      </Text>
                    </Button>
                  )
                }
              </Stack>
            )
          }
        </YStack>
      </XStack>
      <DelayedRender when={modalVisible}>
        <Modal isVisible={modalVisible} style={{ margin: 0 }} backdropTransitionOutTiming={0}>
          <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1, justifyContent: "flex-end" }}>
              <YStack
                flex={1}
                justifyContent="flex-end"
                onPress={closeModal}
              >
                <XStack
                  width={"100%"}
                  paddingVertical={8}
                  alignSelf="flex-end"
                  backgroundColor={"$background"}
                  paddingHorizontal="$3"
                  gap="$2"
                >
                  <Input
                    ref={inputRef}
                    borderColor={borderColor}
                    color={color}
                    height={"100%"}
                    flex={1}
                    multiline
                    minHeight={"$4"}
                    paddingVertical={12}
                    alignItems="center"
                    onBlur={closeModal}
                    autoFocus
                    size={"$4"}
                    fontSize={"$4"}
                    lineHeight={16}
                    onChangeText={setContent}
                    placeholder={
                      isEditing
                        ? comment?.metadata?.content?.content
                        : commonI18n.t("Write a comment")
                    }
                    placeholderTextColor={subtitle}
                  />
                  <Button
                    alignSelf="flex-end"
                    alignItems="center"
                    justifyContent="center"
                    onPress={submitComment}
                  >
                    {commonI18n.t("Publish")}
                  </Button>
                </XStack>
              </YStack>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </DelayedRender>
    </>
  );
};
