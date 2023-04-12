import { Logo } from "@/constants/resource";
import { DrawerHeaderProps } from "@react-navigation/drawer";
import { FC, useCallback } from "react";
import { Image, Text, Stack, XStack, Button, YStack } from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NavigationHeader: FC<DrawerHeaderProps> = (props) => {
    const { navigation } = props
    const { top } = useSafeAreaInsets()

    const onPress = useCallback(() => {
        navigation.toggleDrawer()
    }, [])

    return <XStack paddingTop={top} backgroundColor={'white'}>
        <XStack flex={1} h={'$3'} alignItems={'center'} paddingHorizontal={'$2'}>
            {/* <Button
                pressStyle={{ opacity: 0.5 }}
                circular
                color={'white'}
                backgroundColor={'black'}
                onPress={onPress}
                borderRadius={'$9'}
                icon={Plug}
                zIndex={2}
            /> */}
            <XStack position="absolute" bottom={'$1.5'} left={0} right={0} justifyContent={'center'} alignItems={'center'}>
                <Image source={Logo} resizeMode={'contain'} w={'$3'} h={"$3"} />
                <Text fontWeight={'700'} fontSize={24}>xLog</Text>
            </XStack>
        </XStack>
    </XStack>
}