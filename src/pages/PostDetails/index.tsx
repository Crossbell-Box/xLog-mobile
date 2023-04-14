import { RootStackParamList } from "@/navigation/types"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { FC } from "react"
import { StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {  Text } from "tamagui"

export interface Props {
    postId: string
}

export const PostDetailsPage: FC<NativeStackScreenProps<RootStackParamList, 'PostDetails'>> = (props) => {
    const { route } = props
    const { params } = route

    return <SafeAreaView style={styles.container}>
        <Text>
            {params.postId}
        </Text>
    </SafeAreaView>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
