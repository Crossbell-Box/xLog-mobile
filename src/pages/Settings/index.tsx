import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectedAccount } from "@crossbell/react-account";
import { ArrowRight, Check, Eye, Info, Palette, Thermometer } from "@tamagui/lucide-icons";
import { ListItem, Text, ListItemTitle, Switch, YGroup, YStack, Stack } from "tamagui";

import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { useColors } from "@/hooks/use-colors";
import { useThemeStore } from "@/hooks/use-theme-store";
import { allThemes } from "@/styles/theme";

import packageJson from "../../../package.json";

export interface Props {

}

export const Settings: React.FC<Props> = () => {
  const { primary, background } = useColors();
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const { mode, theme, changeTheme } = useThemeStore();
  const snapPoints = useMemo(() => ["40%"], []);
  const { t } = useTranslation("common");
  const connectedAccount = useConnectedAccount();
  const { toggleMode, toggleFollowSystem, followSystem, isDarkMode } = useThemeStore();

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <SafeAreaView style={styles.container}>
      <YStack flex={1}>
        <ScrollView>
          <YStack gap="$3" padding="$3">
            <YGroup bordered>
              <YGroup.Item>
                <ListItem
                  icon={Thermometer}
                  scaleIcon={1.2}
                  iconAfter={() => (
                    <Switch checked={followSystem} backgroundColor={primary} size="$3" onCheckedChange={toggleFollowSystem}>
                      <Switch.Thumb animation="bouncy" />
                    </Switch>
                  )}
                >
                  <ListItemTitle>
                    {t("Follow System")}
                  </ListItemTitle>
                </ListItem>
              </YGroup.Item>
              {
                !followSystem && (
                  <YGroup.Item>
                    <ListItem
                      icon={Eye}
                      scaleIcon={1.2}
                      iconAfter={() => {
                        return (
                          <Switch checked={isDarkMode} backgroundColor={primary} size="$3" onCheckedChange={toggleMode}>
                            <Switch.Thumb animation="bouncy" />
                          </Switch>
                        );
                      }}
                    >
                      <ListItemTitle>
                        {t("Dark Mode")}
                      </ListItemTitle>
                    </ListItem>
                  </YGroup.Item>
                )
              }
              <YGroup.Item>
                <ListItem
                  icon={Palette}
                  scaleIcon={1.2}
                  onPress={openBottomSheet}
                  iconAfter={<ArrowRight />}
                >
                  <ListItemTitle>
                    {t("Theme")}
                  </ListItemTitle>
                </ListItem>
              </YGroup.Item>
              <YGroup.Item>
                <ListItem
                  icon={Info}
                  scaleIcon={1.2}
                  iconAfter={<Text color="$color">{packageJson.version}</Text>}
                >
                  <ListItemTitle>
                    {t("Version")}
                  </ListItemTitle>
                </ListItem>
              </YGroup.Item>
            </YGroup>
          </YStack>

        </ScrollView>
        {connectedAccount && (
          <Stack marginHorizontal="$4">
            <DisconnectBtn navigateToLogin={false} />
          </Stack>
        )}
      </YStack>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        backgroundStyle={{ backgroundColor: background }}
      >
        <ScrollView>
          <YStack gap="$3" padding="$3">
            <YGroup bordered>
              {
                allThemes.map(({ themeName, definitions }) => {
                  const t = definitions[mode];
                  const isChecked = theme.startsWith(themeName);
                  return (
                    <YGroup.Item key={themeName}>
                      <ListItem
                        scaleIcon={1.2}
                        backgroundColor={t?.background}
                        onPress={() => changeTheme(themeName)}
                        iconAfter={isChecked && <Check color={t.primary} />}
                      >
                        <ListItemTitle color={t.primary}>
                          {themeName}
                        </ListItemTitle>
                      </ListItem>
                    </YGroup.Item>
                  );
                })
              }
            </YGroup>
          </YStack>
        </ScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
