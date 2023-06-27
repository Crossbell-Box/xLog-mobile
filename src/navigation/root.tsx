import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStackNavigator } from "@react-navigation/stack";
import type { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";
import { XCircle } from "@tamagui/lucide-icons";
import * as SplashScreen from "expo-splash-screen";
import { XStack } from "tamagui";

import { useMounted } from "@/hooks/use-mounted";
import { CharacterListPage } from "@/pages/CharacterList";
import { LoginPage } from "@/pages/Login";
import { PostDetailsPage } from "@/pages/PostDetails";
import { AchievementsPage } from "@/pages/Profile/Achievements";
import { CommentsPage } from "@/pages/Profile/Comments";
import { DashboardPage } from "@/pages/Profile/Dashboard";
import { EventsPage } from "@/pages/Profile/Events";
import { NotificationsPageWithModal } from "@/pages/Profile/Notifications";
import { PagesPage } from "@/pages/Profile/Pages";
import { PostsPage } from "@/pages/Profile/Posts";
import { RepliesPage } from "@/pages/Replies";
import { UserInfoPageWithModal } from "@/pages/UserInfo";
import { WebPage } from "@/pages/Web";

import { HomeNavigator } from "./home";
import { SettingsNavigator } from "./settings";
import type { RootStackParamList } from "./types";

const RootStack = createStackNavigator<RootStackParamList>();

const config: TransitionSpec = {
  animation: "spring",
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};
export const RootNavigator = () => {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useTranslation("common");

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => { });
  }, []);

  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name={"Home"} component={HomeNavigator} />
      <RootStack.Screen name={"PostDetails"} component={PostDetailsPage} />

      <RootStack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <RootStack.Screen
          name={"Login"}
          component={LoginPage}
          options={{
            title: t("Connect Wallet"),
            headerStyle: { elevation: 0, shadowOpacity: 0 },
            headerBackTitleVisible: false,
            headerBackImage(props) {
              return (
                <XStack {...props} paddingLeft={"$4"} >
                  <XCircle size={24} color={props.tintColor} />
                </XStack>
              );
            },
          }}
        />
      </RootStack.Group>

      <RootStack.Group screenOptions={{ headerShown: true, headerBackTitle: t("Back") }}>
        <RootStack.Screen name={"Replies"} component={RepliesPage} options={{ title: t("Replies") }} />
        <RootStack.Screen name={"CharacterListPage"} component={CharacterListPage} options={{ title: "" }} />
        <RootStack.Screen name={"Web"} component={WebPage} options={{ title: "" }} />
        <RootStack.Screen name={"UserInfo"} component={UserInfoPageWithModal} options={{ title: "", headerBackTitleVisible: false }} />

        <RootStack.Screen name={"SettingsNavigator"} component={SettingsNavigator} options={{ headerShown: false }}/>
      </RootStack.Group>

      <RootStack.Group screenOptions={{
        headerShown: false,
        cardStyle: { paddingTop: top, paddingBottom: bottom },
        transitionSpec: {
          open: config,
          close: config,
        },
      }}>
        <RootStack.Screen name={"Dashboard"} component={DashboardPage} options={{ title: t("Dashboard") }} />
        <RootStack.Screen name={"Posts"} component={PostsPage} options={{ title: t("Posts") }} />
        <RootStack.Screen name={"Pages"} component={PagesPage} options={{ title: t("Pages") }} />
        <RootStack.Screen name={"Comments"} component={CommentsPage} options={{ title: t("Comment") }} />
        <RootStack.Screen name={"Achievements"} component={AchievementsPage} options={{ title: t("Achievements") }} />
        <RootStack.Screen name={"Events"} component={EventsPage} options={{ title: t("Events") }} />
        <RootStack.Screen name={"Notifications"} component={NotificationsPageWithModal} options={{ title: t("Notifications") }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};
