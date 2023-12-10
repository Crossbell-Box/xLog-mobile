import React from "react";
import { useTranslation } from "react-i18next";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Advanced } from "@/pages/Advanced";
import { Settings } from "@/pages/Settings";

import type { SettingsStackParamList } from "./types";

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator = () => {
  const i18n = useTranslation("common");

  return (
    <SettingsStack.Navigator initialRouteName="Settings">
      <SettingsStack.Screen
        name={"Settings"}
        component={Settings}
        options={{
          title: i18n.t("Settings"),
          headerBackTitleVisible: false,
        }}
      />
      <SettingsStack.Screen
        name={"Advanced"}
        component={Advanced}
        options={{
          title: i18n.t("Advanced"),
          headerBackTitleVisible: false,
        }}
      />
    </SettingsStack.Navigator>
  );
};
