import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { createStackNavigator } from "@react-navigation/stack";
import type { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";

import { PostDetailsPage } from "@/pages/PostDetails";
import { AchievementsPage } from "@/pages/Profile/Achievements";
import { CommentsPage } from "@/pages/Profile/Comments";
import { DashboardPage } from "@/pages/Profile/Dashboard";
import { EventsPage } from "@/pages/Profile/Events";
import { NotificationsPage } from "@/pages/Profile/Notifications";
import { PagesPage } from "@/pages/Profile/Pages";
import { PostsPage } from "@/pages/Profile/Posts";
import { WebPage } from "@/pages/Web";

import { HomeNavigator } from "./home";
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
  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name={"Home"} component={HomeNavigator} />
      <RootStack.Screen name={"PostDetails"} component={PostDetailsPage} />
      <RootStack.Screen
        name={"Web"}
        component={WebPage}
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "返回",
        }}
      />

      {/* Profile */}
      <RootStack.Group screenOptions={{
        headerShown: false,
        cardStyle: { paddingTop: top, paddingBottom: bottom },
        transitionSpec: {
          open: config,
          close: config,
        },
      }}>
        <RootStack.Screen name={"Dashboard"} component={DashboardPage} options={{ title: "仪表盘" }} />
        <RootStack.Screen name={"Posts"} component={PostsPage} options={{ title: "文章" }} />
        <RootStack.Screen name={"Pages"} component={PagesPage} options={{ title: "页面" }} />
        <RootStack.Screen name={"Comments"} component={CommentsPage} options={{ title: "评论" }} />
        <RootStack.Screen name={"Achievements"} component={AchievementsPage} options={{ title: "成就" }} />
        <RootStack.Screen name={"Events"} component={EventsPage} options={{ title: "活动" }} />
        <RootStack.Screen name={"Notifications"} component={NotificationsPage} options={{ title: "通知" }} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};
