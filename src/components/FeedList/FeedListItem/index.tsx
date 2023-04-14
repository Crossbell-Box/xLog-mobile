import { RootStackParamList } from "@/navigation/types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { FC } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card, H3, Paragraph, Stack, Text } from "tamagui";

export interface Props {
    title: string
}

export const FeedListItem: FC<Props> = (props) => {
    const { title } = props;
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();


    const onPress = React.useCallback(() => {
        navigation.navigate(
            "PostDetails",
            {
                postId: title // TODO: change to real postId, just for demo
            }
        )
    }, [title])

    return <TouchableOpacity activeOpacity={0.65} onPress={onPress}>
        <Card elevate size="$4" bordered>
            <Card.Header padded>
                <H3>{title}</H3>
                <Paragraph theme="alt2">
                    There are some text here~There are some text here~There are some text here~There are some text here~There are some text here~There are some text here~There are some text here~
                </Paragraph>
            </Card.Header>
        </Card>
    </TouchableOpacity>
}