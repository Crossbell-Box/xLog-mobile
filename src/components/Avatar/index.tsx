import { toGateway } from "@/utils/ipfs-parser";
import { Image } from "expo-image";
import { FC } from "react";
import { Avatar as _Avatar } from "tamagui";
import { StyleSheet } from "react-native";
import ContentLoader, { Circle } from "react-content-loader/native";

interface Props {
    uri?: string
}

export const Avatar: FC<Props> = (props) => {
    const { uri } = props;
    const size = 45;

    if (!uri) {
        return null
    }


    if (!uri.startsWith("/assets/")) {
        try {
            new URL(uri)
        } catch (error) {
            return null
        }
    }

    return <_Avatar
        size={size}
        bordered
        circular
        backgroundColor="white"
    >
        <_Avatar.Image src={toGateway(uri)} />
        <_Avatar.Fallback delayMs={250}>
            <ContentLoader viewBox={`0 0 ${size} ${size}`} backgroundColor={'gray'} opacity="0.3">
                <Circle x="0" y="0" cx={size / 2} cy={size / 2} r={size} />
            </ContentLoader>
        </_Avatar.Fallback>
    </_Avatar>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [
            { scale: 0.8 }
        ]
    },
});
