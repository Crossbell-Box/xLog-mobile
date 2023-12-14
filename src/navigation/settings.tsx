import type { FC } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { HeaderBackButton } from "@react-navigation/elements";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Advanced } from "@/pages/Advanced";
import { Settings } from "@/pages/Settings";

import type { SettingsStackParamList } from "./types";

const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsNavigator: FC<NativeStackScreenProps<SettingsStackParamList, "Settings">> = ({ navigation }) => {
  const i18n = useTranslation("common");

  return (
    <SettingsStack.Navigator initialRouteName="Settings">
      <SettingsStack.Screen
        name={"Settings"}
        component={Settings}
        options={{
          headerLeft: props => <HeaderBackButton {...props} onPress={navigation.goBack} />,
          title: i18n.t("Settings"),
        }}
      />
      <SettingsStack.Screen
        name={"Advanced"}
        component={Advanced}
        options={{
          headerBackVisible: true,
          headerBackTitleVisible: false,
          title: i18n.t("Advanced"),
        }}
      />
    </SettingsStack.Navigator>
  );
};
