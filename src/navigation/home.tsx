import { useColor } from '@/hooks/styles';
import { FeedPage } from '@/pages/Feed';
import { createDrawerNavigator, DrawerContent } from '@react-navigation/drawer';
import { Text, useWindowDimensions } from 'tamagui';
import { HomeDrawerParamList } from './types';
import { i18n } from '@/i18n';

const HomeDrawerStack = createDrawerNavigator<HomeDrawerParamList>();

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
            drawerContent={(props) => {
                return <DrawerContent {...props} />;
            }}
        >
            <HomeDrawerStack.Screen
                name={"Feed"}
                component={FeedPage}
                options={{ drawerLabel: i18n.t('feed') }}
            />
        </HomeDrawerStack.Navigator>
    );
};