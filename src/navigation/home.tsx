import { NavigationHeader } from '@/components/Header';
import { useColor } from '@/hooks/styles';
import { ArticleList } from '@/pages/ArticleList';
import { createDrawerNavigator, DrawerContent } from '@react-navigation/drawer';
import { Text } from 'tamagui';
import { HomeDrawerParamList } from './types';

const HomeDrawerStack = createDrawerNavigator<HomeDrawerParamList>();

export const HomeNavigator = () => {
    const { primary } = useColor()

    return (
        <HomeDrawerStack.Navigator
            initialRouteName="ArticleList"
            screenOptions={{
                header: (props) => <NavigationHeader {...props} />,
                drawerActiveTintColor: primary,
                drawerLabel(props) {
                    console.log(props)
                    return <Text>{props.color}</Text>;
                },
            }}
            drawerContent={(props) => {
                return <DrawerContent {...props} />;
            }}
        >
            <HomeDrawerStack.Screen name={"ArticleList"} component={ArticleList} options={{ drawerLabel: "文章列表" }} />
        </HomeDrawerStack.Navigator>
    );
};