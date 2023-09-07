import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import type { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";
import { ArrowLeftCircle } from "@tamagui/lucide-icons";
import { Stack, Text, XStack } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import { useSplash } from "@/hooks/use-splash";
import { CharacterListPage } from "@/pages/CharacterList";
import { ClaimCSBPage } from "@/pages/ClaimCSB";
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
  const { hideSplash } = useSplash();

  useEffect(() => {
    hideSplash();
  }, []);

  // return (
  //   <BottomSheet enablePanDownToClose snapPoints={["20%", "80%"]} backgroundStyle={{ backgroundColor: "red" }}>
  //     <Text>11</Text>
  //     <Text>11</Text>
  //   </BottomSheet>
  // );

  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name={"Home"} component={HomeNavigator} />
      <RootStack.Screen name={"PostDetails"} component={PostDetailsPage}/>
      <RootStack.Screen name={"UserInfo"} component={OthersUserInfoPage}/>

      <RootStack.Group screenOptions={{
        presentation: "transparentModal",
        cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS,
        headerShown: true,
      }}>
        <RootStack.Screen name={"Login"} component={LoginPage} options={{ headerShown: false }}/>
      </RootStack.Group>

      <RootStack.Group screenOptions={{ presentation: "modal", headerShown: true }}>
        <RootStack.Screen
          name={"ClaimCSB"}
          component={ClaimCSBPage}
          options={{
            title: i18n.t("Claim CSB"),
            headerStyle: { elevation: 0, shadowOpacity: 0 },
            headerBackTitleVisible: false,
            headerBackImage(props) {
              return (
                <XStack {...props} paddingLeft={"$4"} >
                  <ArrowLeftCircle size={24} color={props.tintColor} />
                </XStack>
              );
            },
          }}
        />
      </RootStack.Group>

      <RootStack.Group screenOptions={{ headerShown: true, headerBackTitle: i18n.t("Back") }}>
        <RootStack.Screen name={"Replies"} component={RepliesPage} options={{ title: i18n.t("Replies") }} />
        <RootStack.Screen name={"CharacterListPage"} component={CharacterListPage} options={{ title: "" }} />
        <RootStack.Screen name={"SettingsNavigator"} component={SettingsNavigator} options={{ headerShown: false }}/>
        <RootStack.Screen name={"Web"} component={WebPage} options={{ title: "" }} />
        <RootStack.Screen name={"Search"} component={SearchPage} options={{ headerShown: false }} />
      </RootStack.Group>

      <RootStack.Group screenOptions={{
        headerShown: false,
        cardStyle: { paddingBottom: bottom },
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
