import type { FC } from "react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ViewStyle } from "react-native";
import { Dimensions, StyleSheet } from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import removeMd from "remove-markdown";
import { Card, H5, Paragraph, SizableText, Spacer, Text, XStack } from "tamagui";

import { ImageGallery } from "@/components/ImageGallery";
import { useDate } from "@/hooks/use-date";
import type { RootStackParamList } from "@/navigation/types";
import type { ExpandedNote } from "@/types/crossbell";
import { findCoverImage } from "@/utils/find-cover-image";

export interface Props {
  note: ExpandedNote
  style?: ViewStyle
}

const { width } = Dimensions.get("window");

export const PostsListItem: FC<Props> = (props) => {
  const { note } = props;
  const date = useDate();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const i18n = useTranslation();
  const [displayImageUris, setDisplayImageUris] = React.useState<string[]>([]);
  const onPress = React.useCallback(() => {
    navigation.navigate(
      "PostDetails",
      {
        characterId: note.characterId,
        note,
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
  }, [note?.metadata.content.content]);

  const closeModal = React.useCallback(() => {
    setDisplayImageUris([]);
  }, []);

  const cover = note?.metadata?.content?.cover;

  return (
    <>
      <TouchableOpacity style={props.style} activeOpacity={0.65} onPress={onPress}>
        <Card size="$4">
          <Card.Header padded>
            {cover && <Image contentFit={"cover"} source={{ uri: cover }} style={{ width: "100%", height: 150, borderRadius: 10, marginBottom: 8 }} />}
            {
              note?.metadata.content.title && (
                <Text
                  fontWeight={"700"}
                  color="$color"
                  marginBottom={"$1"}
                  numberOfLines={1}
                  fontSize={"$6"}
                  marginVertical={"$2"}
                >
                  {String(note.metadata.content.title).replaceAll(" ", "")}
                </Text>
              )
            }

            <XStack justifyContent={coverImage.isSingle ? "space-between" : "flex-start"}>
              {
                note?.metadata?.content?.summary && (
                  <Paragraph
                    width={coverImage.isSingle ? "65%" : "100%"}
                    numberOfLines={coverImage.isSingle ? 5 : 3}
                    size={"$2"}
                    color="$colorSubtitle"
                  >
                    {removeMd(
                      String(note?.metadata?.content?.summary.slice(0, 100)).replace(/(\r\n|\n|\r)/gm, " "),
                    )}
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
                  <Spacer size={"$2"} />
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
            <XStack marginTop={"$2"} justifyContent="space-between">
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
              <SizableText size={"$2"} numberOfLines={1} color="$colorSubtitle">
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
