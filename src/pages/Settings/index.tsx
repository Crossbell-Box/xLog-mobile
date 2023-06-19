import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, View, Linking, Platform } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectedAccount } from "@crossbell/react-account";
import { ArrowRight, Check, Copy, Eye, Info, Palette, Thermometer } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import * as Clipboard from "expo-clipboard";
import { ListItem, Text, ListItemTitle, Switch, YGroup, YStack, Stack, Button } from "tamagui";

import type { AlertDialogInstance } from "@/components/AlertDialog";
import { AlertDialog } from "@/components/AlertDialog";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { APP_SCHEME, IS_DEV, IS_PROD, IS_STAGING, VERSION } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useMultiPressHandler } from "@/hooks/use-multi-press-handler";
import { useNotification } from "@/hooks/use-notification";
import type { NotificationError } from "@/hooks/use-notification-setup";
import { useThemeStore } from "@/hooks/use-theme-store";
import { allThemes } from "@/styles/theme";

export interface Props {

}

export const Settings: React.FC<Props> = () => {
  const { primary, background } = useColors();
  const [devMenuVisible, setDevMenuVisible] = React.useState(false);
  const handleMultiPress = useMultiPressHandler(
    () => setDevMenuVisible(true),
    {
      threshold: 7,
      interval: 300,
      disabled: IS_PROD || devMenuVisible,
    },
  );
  const alertDialogRef = useRef<AlertDialogInstance>(null);
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const { mode, theme, changeTheme } = useThemeStore();
  const snapPoints = useMemo(() => ["40%"], []);
  const { t } = useTranslation("common");
  const connectedAccount = useConnectedAccount();
  const toast = useToastController();
  const { expoPushToken, requestPermissions } = useNotification();
  const { toggleMode, toggleFollowSystem, followSystem, isDarkMode } = useThemeStore();

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const copyPushToken = () => {
    if (expoPushToken) {
      Clipboard.setStringAsync(expoPushToken).then(() => {
        toast.show(t("Push Token Copied"), {
          burntOptions: {
            preset: "done",
            haptic: "success",
          },
        });
      });
    }
    else {
      requestPermissions().catch(() => {
        alertDialogRef.current?.toggle(true);
      });
    }
  };

  const closeAlertDialog = () => alertDialogRef.current?.toggle(false);

  const onConfirm = () => {
    closeAlertDialog();

    if (Platform.OS === "ios") {
      Linking.openURL(`app-settings:${APP_SCHEME}`);
    }
    else {
      Linking.openSettings();
    }
  };

  return (
    <>
      <AlertDialog
        ref={alertDialogRef}
        title={t("Alert")}
        description={t("Please allow xLog to send you notifications so that you can receive the latest updates from the creators you follow.")}
        renderCancel={() => <Button onPress={closeAlertDialog}>{t("Cancel")}</Button>}
        renderConfirm={() => <Button onPress={onConfirm}>{t("Confirm")}</Button>}
      />
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
                    iconAfter={<Text color="$color">{VERSION}</Text>}
                    onPress={handleMultiPress}
                  >
                    <ListItemTitle>
                      {t("Version")}
                    </ListItemTitle>
                  </ListItem>
                </YGroup.Item>
              </YGroup>
              {
                ((devMenuVisible && IS_STAGING) || IS_DEV) && (
                  <Animated.View entering={FadeInUp.duration(250)}>
                    <YGroup bordered>
                      <YGroup.Item>
                        <ListItem
                          icon={Copy}
                          scaleIcon={1.2}
                          iconAfter={<ArrowRight />}
                          onPress={copyPushToken}
                        >
                          <ListItemTitle>
                            {t("Copy Device Token")}
                          </ListItemTitle>
                        </ListItem>
                      </YGroup.Item>
                    </YGroup>
                  </Animated.View>
                )
              }
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
