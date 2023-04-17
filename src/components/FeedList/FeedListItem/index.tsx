import { RootStackParamList } from "@/navigation/types";
import { useNotes } from "@crossbell/indexer";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FC, useMemo } from "react";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Image } from 'expo-image';
import { Card, H3, H5, H6, Paragraph, Spacer, Text, XStack } from "tamagui";
import removeMd from 'remove-markdown';
import { StyleSheet } from "react-native";
import { findCoverImage } from "@/lib/find-conver-image";
import { toGateway } from "@/lib/ipfs-parser";
import { Avatar } from "@/components/Avatar";
import { useDate } from "@/hooks/useDate";
import { i18n } from "@/i18n";

export interface Props {
    note: NoteEntity
}

export type NoteEntity = ReturnType<typeof useNotes>['data']['pages'][number]['list'][number]


export const FeedListItem: FC<Props> = (props) => {
    const { note } = props;
    const date = useDate()
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const onPress = React.useCallback(() => {
        navigation.navigate(
            "PostDetails",
            {
                characterId: note.characterId,
                noteId: note.noteId
            }
        )
    }, [note])

    const coverImage = useMemo(() => {
        const imageUrls = findCoverImage(note.metadata.content.content)

        return {
            uri: imageUrls.length > 1 ? imageUrls : imageUrls[0],
            isSingle: imageUrls.length === 1,
            isMultiple: imageUrls.length > 1
        } as {
            uri: string,
            isSingle: true,
            isMultiple: false
        } | {
            uri: string[],
            isSingle: false,
            isMultiple: true
        }
    }, [note.metadata.content.content])

    return <TouchableOpacity activeOpacity={0.65} onPress={onPress}>
        <Card elevate size="$4" bordered>
            <Card.Header padded>
                <XStack alignItems="center" gap={'$2'} marginBottom={'$1'}>
                    <Avatar uri={note?.character?.metadata?.content?.avatars?.[0]} />
                    <XStack alignItems="center">
                        <H6 color={'#3f3f46'}>{note.character?.metadata?.content?.name || note.character?.handle}</H6>
                        <H3>&nbsp;·&nbsp;</H3>
                        <H6>
                            {i18n.t("ago", {
                                time: date.dayjs
                                    .duration(
                                        date.dayjs(note?.createdAt).diff(date.dayjs(), "minute"),
                                        "minute",
                                    )
                                    .humanize(),
                            })}
                        </H6>
                    </XStack>
                </XStack>
                {
                    note.metadata.content.title && <H5>{String(note.metadata.content.title).replaceAll(" ", "")}</H5>
                }

                {
                    !!note.metadata?.content?.tags?.filter((tag) => tag !== "post" && tag !== "page").length && (
                        <Text numberOfLines={1} color={'#A1A1AA'} marginBottom={6}>
                            {note.metadata?.content?.tags
                                ?.filter((tag) => tag !== "post" && tag !== "page")
                                .map((tag, index) => (
                                    <Text key={tag + index} fontSize={12}>
                                        #{tag} &nbsp;
                                    </Text>
                                ))}
                        </Text>
                    )
                }

                <XStack justifyContent={coverImage.isSingle ? 'space-between' : 'flex-start'}>
                    <Text
                        width={coverImage.isSingle ? '65%' : '100%'}
                        borderWidth={1}
                        numberOfLines={coverImage.isSingle ? 5 : 3}
                        color={'#71717A'}
                    >
                        {removeMd(
                            String(note.metadata.content.content.slice(0, 100)).replace(/(\r\n|\n|\r)/gm, " ")
                        )}
                    </Text>
                    {
                        coverImage.isSingle && <Card bordered borderRadius={8} width={105} height={105}>
                            <Image source={{ uri: coverImage.uri }} style={styles.singleImageWrapper} />
                        </Card>
                    }
                </XStack>
                {
                    coverImage.isMultiple && <>
                        <Spacer size={'$2'} />
                        <ScrollView horizontal>
                            {
                                coverImage.uri.slice(0, 6).map((uri, index) => {
                                    const priority = index <= 3 ? 'high' : 'low';

                                    return <Card key={index} bordered marginRight={'$3'} borderRadius={8} width={120} height={120}>
                                        <Image priority={priority} source={{ uri }} contentFit="cover" style={styles.multipleImageWrapper} />
                                    </Card>
                                })
                            }
                        </ScrollView>
                    </>
                }
            </Card.Header>
        </Card>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    singleImageWrapper: {
        flex: 1
    },
    multipleImageWrapper: {
        flex: 1
    }
})