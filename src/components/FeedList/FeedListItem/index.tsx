import { FC } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Card, H3, Paragraph, Stack, Text } from "tamagui";

export interface Props {
    title: string
}

export const FeedListItem: FC<Props> = (props) => {
    const { title } = props;

    return <TouchableOpacity activeOpacity={0.65} onPress={()=>{console.log(1)}}>
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