import { toGateway } from "@/lib/ipfs-parser";
import { Image } from "expo-image";
import { FC } from "react";
import { Avatar as _Avatar } from "tamagui";
import { LogoResource } from "../Logo";
import { StyleSheet } from "react-native";

interface Props {
    uri?: string
}

export const Avatar: FC<Props> = (props) => {
    const { uri } = props;

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
        size={45}
        bordered
        circular
        backgroundColor="white"
    >
        <_Avatar.Image src={toGateway(uri)} />
        <_Avatar.Fallback>
            <Image source={LogoResource} contentFit={'cover'} style={styles.container} />
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
