import type { FC } from "react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ViewStyle } from "react-native";
import { Dimensions, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import Highlighter from "react-native-highlight-words";

import { Image } from "expo-image";
import { Card, Paragraph, SizableText, Spacer, Text, XStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { ImageGallery } from "@/components/ImageGallery";
import { useColors } from "@/hooks/use-colors";
import { useDate } from "@/hooks/use-date";
import { useRootNavigation } from "@/hooks/use-navigation";
import { findCoverImage } from "@/utils/find-cover-image";

type NoteEntity = any;

export interface Props {
  note: NoteEntity
  style?: ViewStyle
  searchKeyword?: string
}

const { width } = Dimensions.get("window");

export const FeedListItem: FC<Props> = (props) => {
  const { note, searchKeyword } = props;
  const { primary } = useColors();
  const date = useDate();
  const navigation = useRootNavigation();
  const i18n = useTranslation();
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);
  const onPress = React.useCallback(() => {
    navigation.navigate(
      "PostDetails",
      {
        characterId: note.characterId,
        noteId: note.noteId,
      },
    );
  }, [note]);

  const coverImage = useMemo(() => {
    const imageUrls = findCoverImage(note?.metadata?.content?.content);

    return {
      uri: imageUrls.length > 1 ? imageUrls : imageUrls[0],
      isSingle: imageUrls.length === 1,
      isMultiple: imageUrls.length > 1,
    } as {
      uri: string
      isSingle: true
      isMultiple: false
    } | {
      uri: string[]
      isSingle: false
      isMultiple: true
    };
  }, [note?.metadata?.content?.content]);

  const closeModal = React.useCallback(() => {
    setDisplayImageUris([]);
  }, []);

  return (
    <>
      <TouchableOpacity style={props.style} activeOpacity={0.65} onPress={onPress}>
        <Card size="$4">
          <Card.Header padded gap="$1">
            <XStack alignItems="center" gap={"$3"} marginBottom={"$1"}>
              <Avatar character={note?.character} useDefault/>
              <XStack alignItems="center">
                <SizableText size="$5" fontWeight={"700"}>{note?.character?.metadata?.content?.name || note?.character?.handle}</SizableText>
              </XStack>
            </XStack>

            {
              note?.metadata?.content?.title && <SizableText size={"$6"} fontWeight={"700"} color="$color" marginBottom={"$1"} numberOfLines={1}>{String(note?.metadata?.content?.title)}</SizableText>
            }

            <XStack justifyContent={coverImage.isSingle ? "space-between" : "flex-start"} gap="$2">
              {
                note?.metadata?.content?.summary && (
                  <Paragraph
                    width={coverImage.isSingle ? "65%" : "100%"}
                    numberOfLines={coverImage.isSingle ? 5 : 3}
                    lineHeight={"$2"}
                    size={"$4"}
                  >
                    {
                      searchKeyword
                        ? (
                          <Highlighter
                            highlightStyle={{ backgroundColor: primary }}
                            searchWords={[searchKeyword]}
                            textToHighlight={note?.metadata?.content?.summary}
                          />
                        )
                        : note?.metadata?.content?.summary}
                  </Paragraph>
                )
              }
              {
                coverImage.isSingle && (
                  <TouchableOpacity onPress={() => {
                    setDisplayImageUris([coverImage.uri]);
                  }}>
                    <Card bordered borderRadius={8} width={105} height={105}>
                      <Image source={coverImage.uri} style={styles.singleImageWrapper} />
                    </Card>
                  </TouchableOpacity>
                )
              }
            </XStack>
            {
              coverImage.isMultiple && (
                <>
                  <Spacer size={"$3"} />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    {
                      coverImage.uri.slice(0, 6).map((uri, index) => {
                        const priority = index <= 3 ? "high" : "low";

                        return (
                          <TouchableOpacity key={index} onPress={() => {
                            setDisplayImageUris([
                              ...coverImage.uri.slice(index),
                              ...coverImage.uri.slice(0, index),
                            ]);
                          }}>
                            <Card bordered marginRight={"$3"} borderRadius={8} width={120} height={120}>
                              <Image priority={priority} source={uri} contentFit="cover" style={styles.multipleImageWrapper} />
                            </Card>
                          </TouchableOpacity>
                        );
                      })
                    }
                  </ScrollView>
                </>
              )
            }
            <XStack marginTop={"$3"} justifyContent="space-between">
              <Text numberOfLines={1} maxWidth={"70%"}>
                {
                  !!note?.metadata?.content?.tags?.filter(tag => tag !== "post" && tag !== "page").length && (
                    <SizableText size={"$2"} numberOfLines={1} color="$colorSubtitle">
                      {note?.metadata?.content?.tags
                        ?.filter(tag => tag !== "post" && tag !== "page")
                        .map((tag, index) => (
                          <Text key={tag + index} fontSize={12} color="$colorSubtitle">
                            #{tag} &nbsp;
                          </Text>
                        ))}
                    </SizableText>
                  )
                }
              </Text>
              <SizableText size={"$3"} numberOfLines={1} color="$colorSubtitle">
                {i18n.t("ago", {
                  time: date.dayjs
                    .duration(
                      date.dayjs(note?.createdAt).diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })}
              </SizableText>
            </XStack>
          </Card.Header>
        </Card>
        <ImageGallery
          isVisible={displayImageUris.length > 0}
          uris={displayImageUris}
          onClose={closeModal}
        />
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  singleImageWrapper: {
    flex: 1,
  },
  multipleImageWrapper: {
    flex: 1,
  },
  modalImage: {
    width,
    height: width,
  },
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
