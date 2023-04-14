import { useColor } from '@/hooks/styles';
import { FeedPage } from '@/pages/Feed';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Text, useWindowDimensions } from 'tamagui';
import { HomeDrawerParamList } from './types';
import { i18n } from '@/i18n';
import { FC } from 'react';
import { User } from '@tamagui/lucide-icons';

const HomeDrawerStack = createDrawerNavigator<HomeDrawerParamList>();

const DRAWER_TABS_MOCK = [
    {
        name: 'Feed',
        icon: User,
        label: 'Feed'
    },
    {
        name: 'Profile',
        icon: User,
        label: 'Profile'
    },
]


const DrawerContent: FC<DrawerContentComponentProps> = (props) => {
    const { primary } = useColor()
    return (
        <DrawerContentScrollView {...props}>
            {
                DRAWER_TABS_MOCK.map((item, index) => {
                    const { icon: Icon } = item
                    // TODO
                    const isFocused = index === 0;
                    const color = isFocused ? primary : null
                    return <DrawerItem
                        key={index}
                        focused={isFocused}
                        activeTintColor={color}
                        icon={() => <Icon color={color} />}
                        label={item.label}
                        onPress={() => { }}
                    />
                })
            }
        </DrawerContentScrollView>
    );
}

export const HomeNavigator = () => {
    const { primary } = useColor()
    const { width } = useWindowDimensions()

    return (
        <HomeDrawerStack.Navigator
            initialRouteName="Feed"
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: primary,
                drawerLabel(props) {
                    console.log(props)
                    return <Text>{props.color}</Text>;
                },
                drawerStyle: {
                    width: width * 0.8
                },
                sceneContainerStyle: { backgroundColor: "white" }
            }}
            drawerContent={DrawerContent}
        >
            <HomeDrawerStack.Screen
                name={"Feed"}
                component={FeedPage}
                options={{ drawerLabel: i18n.t('feed') }}
            />
        </HomeDrawerStack.Navigator>
    );
};