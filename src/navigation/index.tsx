import { createStackNavigator } from "@react-navigation/stack";

import { PostDetailsPage } from "@/pages/PostDetails";

import { HomeNavigator } from "./home";
import type { RootStackParamList } from "./types";

const RootStack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name={"Home"} component={HomeNavigator} />
      <RootStack.Screen name={"PostDetails"} component={PostDetailsPage} />
    </RootStack.Navigator>
  );
};
