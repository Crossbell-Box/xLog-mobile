import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
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
import { OthersUserInfoPage } from "@/pages/UserInfo";
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
  const i18n = useTranslation("common");

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

      <RootStack.Group screenOptions={{
        presentation: "transparentModal",
        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        headerShown: true,
      }}>
        <RootStack.Screen
          name={"Login"}
          component={LoginPage}
          options={{ headerShown: false }}
        />
      </RootStack.Group>

      <RootStack.Group screenOptions={{ headerShown: true, headerBackTitle: i18n.t("Back") }}>
        <RootStack.Screen name={"Replies"} component={RepliesPage} options={{ title: i18n.t("Replies") }} />
        <RootStack.Screen name={"CharacterListPage"} component={CharacterListPage} options={{ title: "" }} />
        <RootStack.Screen name={"Web"} component={WebPage} options={{ title: "" }} />
        <RootStack.Screen name={"UserInfo"} component={OthersUserInfoPage} options={{ title: "", headerBackTitleVisible: false }} />

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
        <RootStack.Screen name={"Dashboard"} component={DashboardPage} options={{ title: i18n.t("Dashboard") }} />
        <RootStack.Screen name={"Posts"} component={PostsPage} options={{ title: i18n.t("Posts") }} />
        <RootStack.Screen name={"Pages"} component={PagesPage} options={{ title: i18n.t("Pages") }} />
        <RootStack.Screen name={"Comments"} component={CommentsPage} options={{ title: i18n.t("Comment") }} />
        <RootStack.Screen name={"Achievements"} component={AchievementsPage} options={{ title: i18n.t("Achievements") }} />
        <RootStack.Screen name={"Events"} component={EventsPage} options={{ title: i18n.t("Events") }} />
        <RootStack.Screen name={"Notifications"} component={NotificationsPageWithModal} options={{ title: i18n.t("Notifications") }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};
