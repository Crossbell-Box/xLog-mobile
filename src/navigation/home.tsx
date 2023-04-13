import { useColor } from '@/hooks/styles';
import { ArticleListPage } from '@/pages/ArticleList';
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
            initialRouteName="ArticleList"
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: primary,
                drawerLabel(props) {
                    console.log(props)
                    return <Text>{props.color}</Text>;
                },
                drawerStyle: {
                    width: width * 0.65
                },
                sceneContainerStyle: { backgroundColor: "white" }
            }}
            drawerContent={(props) => {
                return <DrawerContent {...props} />;
            }}
        >
            <HomeDrawerStack.Screen name={"ArticleList"} component={ArticleListPage} options={{ drawerLabel: i18n.t('article_list') }} />
        </HomeDrawerStack.Navigator>
    );
};