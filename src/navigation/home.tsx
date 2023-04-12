import { NavigationHeader } from '@/components/Header';
import { ArticleList } from '@/pages/ArticleList';
import { createDrawerNavigator, DrawerContent } from '@react-navigation/drawer';
import { HomeDrawerParamList } from './types';

const HomeDrawerStack = createDrawerNavigator<HomeDrawerParamList>();

export const HomeNavigator = () => {
    return (
        <HomeDrawerStack.Navigator
            initialRouteName="ArticleList"
            screenOptions={{
                header: (props) => <NavigationHeader {...props} />,
            }}
            drawerContent={(props) => {
                return <DrawerContent {...props} />;
            }}
        >
            <HomeDrawerStack.Screen name={"ArticleList"} component={ArticleList} />
        </HomeDrawerStack.Navigator>
    );
};