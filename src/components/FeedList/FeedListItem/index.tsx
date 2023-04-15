import { RootStackParamList } from "@/navigation/types";
import { useNotes } from "@crossbell/indexer";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FC, useMemo } from "react";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Image } from 'expo-image';
import { Card, H5, Paragraph, Spacer, XStack } from "tamagui";
import removeMd from 'remove-markdown';
import { StyleSheet } from "react-native";
import { findCoverImage } from "@/lib/find-conver-image";

export interface Props {
    note: NoteEntity
}

export type NoteEntity = ReturnType<typeof useNotes>['data']['pages'][number]['list'][number]


export const FeedListItem: FC<Props> = (props) => {
    const { note } = props;
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
                {
                    note.metadata.content.title && <H5>{String(note.metadata.content.title).replaceAll(" ", "")}</H5>
                }
                <XStack justifyContent={coverImage.isSingle ? 'space-between' : 'flex-start'}>
                    <Paragraph
                        width={coverImage.isSingle ? '65%' : '100%'}
                        borderWidth={1}
                        lineHeight={"$1"}
                        numberOfLines={coverImage.isSingle ? 5 : 3}
                        theme="alt2"
                    >
                        {removeMd(
                            String(note.metadata.content.content.slice(0, 100)).replace(/(\r\n|\n|\r)/gm, " ")
                        )}
                    </Paragraph>
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
                                        <Image priority={priority} source={{ uri }} resizeMode="cover" style={styles.multipleImageWrapper} />
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