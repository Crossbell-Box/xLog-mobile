import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { IS_ANDROID } from "@/constants";
import { useSplash } from "@/hooks/use-splash";
import { CharacterListPage } from "@/pages/CharacterList";
import { ClaimCSBPage } from "@/pages/ClaimCSB";
import { CreateShotsPage } from "@/pages/CreateShots";
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
import { SearchPage } from "@/pages/Search";
import { TakePhotoPage } from "@/pages/TakePhoto";
import { OthersUserInfoPage } from "@/pages/UserInfo";
import { WebPage } from "@/pages/Web";

import { HomeNavigator } from "./home";
import { SettingsNavigator } from "./settings";
import type { RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { bottom } = useSafeAreaInsets();
  const i18n = useTranslation("common");
  const { hideSplash } = useSplash();

  useEffect(() => {
    hideSplash();
  }, []);

  return (
    <RootStack.Navigator initialRouteName="Home">
      {/* Without header */}
      <RootStack.Group screenOptions={{ headerShown: false }}>
        <RootStack.Screen name={"Home"} component={HomeNavigator} />
        <RootStack.Screen
          name={"PostDetails"}
          component={PostDetailsPage}
          options={{ animation: IS_ANDROID ? "fade" : "slide_from_right" }}
        />
        <RootStack.Screen name={"UserInfo"} component={OthersUserInfoPage}/>
        <RootStack.Screen name={"TakePhoto"} component={TakePhotoPage}/>
      </RootStack.Group>

      {/* Transparent modal */}
      <RootStack.Group screenOptions={{ presentation: "transparentModal", animation: "none", headerShown: true }}>
        <RootStack.Screen name={"Login"} component={LoginPage} options={{ headerShown: false }}/>
      </RootStack.Group>

      <RootStack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <RootStack.Screen
          name={"ClaimCSB"}
          component={ClaimCSBPage}
          options={{
            title: i18n.t("Claim CSB"),
            headerShadowVisible: false,
            headerBackTitleVisible: false,
            headerBackVisible: false,
          }}
        />
      </RootStack.Group>

      <RootStack.Group screenOptions={{ headerShown: true, headerBackTitle: i18n.t("Back") }}>
        <RootStack.Screen name={"Replies"} component={RepliesPage} options={{ title: i18n.t("Replies") }} />
        <RootStack.Screen name={"CharacterListPage"} component={CharacterListPage} options={{ title: "" }} />
        <RootStack.Screen name={"SettingsNavigator"} component={SettingsNavigator} options={{ headerShown: false }}/>
        <RootStack.Screen name={"Web"} component={WebPage} options={{ title: "" }} />
        <RootStack.Screen name={"Search"} component={SearchPage} options={{ headerShown: false }} />
        <RootStack.Screen name={"CreateShots"} component={CreateShotsPage}options={{ headerTitle: "", headerBackTitleVisible: false }} />
      </RootStack.Group>

      <RootStack.Group screenOptions={{
        headerShown: false,
        contentStyle: { paddingBottom: bottom },
      }}>
        <RootStack.Screen name={"Dashboard"} component={DashboardPage} options={{ title: i18n.t("Dashboard") }} />
        <RootStack.Screen name={"Posts"} component={PostsPage} options={{ title: i18n.t("Posts") }} />
        <RootStack.Screen name={"Pages"} component={PagesPage} options={{ title: i18n.t("Pages") }} />
        <RootStack.Screen name={"Comments"} component={CommentsPage} options={{ title: i18n.t("Comment") }} />
        <RootStack.Screen name={"Achievements"} component={AchievementsPage}
          options={{
            title: i18n.t("Achievements"),
            contentStyle: { backgroundColor: "black" },
          }}
        />
        <RootStack.Screen name={"Events"} component={EventsPage} options={{ title: i18n.t("Events") }} />
        <RootStack.Screen name={"Notifications"} component={NotificationsPageWithModal} options={{ title: i18n.t("Notifications") }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};
