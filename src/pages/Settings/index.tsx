import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, Linking, Platform } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useConnectedAccount, useIsConnected } from "@crossbell/react-account";
import { ArrowDownToLine, ArrowRight, Check, Cog, Copy, Eye, Info, Palette, TestTube, Thermometer, TrendingUp } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import * as Sentry from "sentry-expo";
import { ListItem, Text, ListItemTitle, Switch, YGroup, YStack, Stack } from "tamagui";

import { AlertDialog } from "@/components/AlertDialog";
import { Button } from "@/components/Base/Button";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { APP_SCHEME, IS_DEV, IS_PROD, IS_TEST, VERSION } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useMultiPressHandler } from "@/hooks/use-multi-press-handler";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useNotification } from "@/hooks/use-notification";
import { useThemeStore } from "@/hooks/use-theme-store";
import { useToggle } from "@/hooks/use-toggle";
import { allThemes } from "@/styles/theme";
import { GA } from "@/utils/GA";
import { checkHotUpdates } from "@/utils/hot-updates";

export interface Props {

}

export const Settings: React.FC<Props> = () => {
  const { primary, background } = useColors();
  const [devMenuVisible, setDevMenuVisible] = React.useState(false);
  const isConnected = useIsConnected();
  const handleMultiPress = useMultiPressHandler(
    () => {
      if (IS_TEST) {
        setDevMenuVisible(true);
      }
      else if (IS_PROD) {
        checkNewUpdates(true);
      }
    },
    {
      threshold: 7,
      interval: 300,
      disabled: IS_DEV || devMenuVisible,
    },
  );
  const [notificationAlertDialogVisible, notificationAlertDialogToggle] = useToggle(false);
  const [updatesAlertDialogVisible, updatesAlertDialogToggle] = useToggle(false);
  const bottomSheetRef = useRef<BottomSheetModalInstance>(null);
  const { mode, theme, changeTheme } = useThemeStore();
  const snapPoints = useMemo(() => ["40%"], []);
  const i18n = useTranslation("common");
  const connectedAccount = useConnectedAccount();
  const toast = useToastController();
  const navigation = useRootNavigation();
  const { expoPushToken, requestPermissions } = useNotification();
  const { toggleMode, toggleFollowSystem, followSystem, isDarkMode } = useThemeStore();

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const checkNewUpdates = (silent: boolean) => {
    checkHotUpdates()
      .then(async () => {
        if (silent) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await new Promise(resolve => setTimeout(resolve, 1000));
          await Updates.reloadAsync();
        }
        else {
          updatesAlertDialogToggle(true);
        }
      })
      .catch(() => {
        if (silent) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        else {
          toast.show(i18n.t("No Updates"), {
            burntOptions: {
              preset: "error",
              haptic: "error",
            },
          });
        }
      });
  };

  const copyPushToken = () => {
    if (expoPushToken) {
      Clipboard.setStringAsync(expoPushToken).then(() => {
        toast.show(i18n.t("Push Token Copied"), {
          burntOptions: {
            preset: "done",
            haptic: "success",
          },
        });
      });
    }
    else {
      requestPermissions().catch(() => {
        notificationAlertDialogToggle(true);
      });
    }
  };

  const testGA = () => {
    GA.logEvent("test", {
      test: "test",
    }).then(() => {
      toast.show(i18n.t("Sended"), {
        burntOptions: {
          preset: "done",
          haptic: "success",
        },
      });
    }).catch((err) => {
      toast.show(err.message, {
        burntOptions: {
          preset: "error",
          haptic: "error",
        },
      });
    });
  };

  const testSentry = () => {
    // Send a test error to Sentry.
    Sentry.Native.captureException(new Error("Test Sentry"));
    toast.show(i18n.t("Sended"), {
      burntOptions: {
        preset: "done",
        haptic: "success",
      },
    });
  };

  const closeNotificationAlertDialog = () => notificationAlertDialogToggle(false);
  const closeUpdatesAlertDialog = () => updatesAlertDialogToggle(false);

  const onNotificationAlertConfirm = () => {
    closeNotificationAlertDialog();

    if (Platform.OS === "ios") {
      Linking.openURL(`app-settings:${APP_SCHEME}`);
    }
    else {
      Linking.openSettings();
    }
  };

  const onUpdatesAlertConfirm = () => {
    Updates.reloadAsync();
  };

  const navigateToAdvancedPage = () => {
    navigation.navigate("SettingsNavigator", {
      screen: "Advanced",
    });
  };

  const checkUpdates = () => checkNewUpdates(false);

  return (
    <>
      <AlertDialog
        title={i18n.t("Alert")}
        visible={notificationAlertDialogVisible}
        description={i18n.t("Please allow xLog to send you notifications so that you can receive the latest updates from the creators you follow.")}
        renderCancel={() => <Button onPress={closeNotificationAlertDialog}>{i18n.t("Cancel")}</Button>}
        renderConfirm={() => <Button type="primary" onPress={onNotificationAlertConfirm}>{i18n.t("Confirm")}</Button>}
      />

      <AlertDialog
        title={i18n.t("Alert")}
        visible={updatesAlertDialogVisible}
        description={i18n.t("New update available, click to restart.")}
        renderCancel={() => <Button onPress={closeUpdatesAlertDialog}>{i18n.t("Cancel")}</Button>}
        renderConfirm={() => <Button type="primary" onPress={onUpdatesAlertConfirm}>{i18n.t("Confirm")}</Button>}
      />

      <SafeAreaView edges={["bottom"]} style={styles.container}>
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
                      {i18n.t("Follow System")}
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
                          {i18n.t("Dark Mode")}
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
                      {i18n.t("Theme")}
                    </ListItemTitle>
                  </ListItem>
                </YGroup.Item>
                {
                  isConnected && (
                    <YGroup.Item>
                      <ListItem
                        icon={Cog}
                        scaleIcon={1.2}
                        iconAfter={<ArrowRight />}
                        onPress={navigateToAdvancedPage}
                      >
                        <ListItemTitle>
                          {i18n.t("Advanced")}
                        </ListItemTitle>
                      </ListItem>
                    </YGroup.Item>
                  )
                }
                <YGroup.Item>
                  <ListItem
                    icon={Info}
                    scaleIcon={1.2}
                    iconAfter={<Text color="$color">{VERSION}</Text>}
                    onPress={handleMultiPress}
                  >
                    <ListItemTitle>
                      {i18n.t("Version")}
                    </ListItemTitle>
                  </ListItem>
                </YGroup.Item>
              </YGroup>
              {
                ((devMenuVisible && IS_TEST) || IS_DEV) && (
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
                            {i18n.t("Copy Push Token")}
                          </ListItemTitle>
                        </ListItem>
                      </YGroup.Item>
                      <YGroup.Item>
                        <ListItem
                          icon={TrendingUp}
                          scaleIcon={1.2}
                          iconAfter={<ArrowRight />}
                          onPress={testGA}
                        >
                          <ListItemTitle>
                            {i18n.t("Test GA")}
                          </ListItemTitle>
                        </ListItem>
                      </YGroup.Item>
                      <YGroup.Item>
                        <ListItem
                          icon={ArrowDownToLine}
                          scaleIcon={1.2}
                          iconAfter={<ArrowRight />}
                          onPress={checkUpdates}
                        >
                          <ListItemTitle>
                            {i18n.t("Check updates")}
                          </ListItemTitle>
                        </ListItem>
                      </YGroup.Item>
                      {!IS_DEV && (
                        <YGroup.Item>
                          <ListItem
                            icon={TestTube}
                            scaleIcon={1.2}
                            iconAfter={<ArrowRight />}
                            onPress={testSentry}
                          >
                            <ListItemTitle>
                              {i18n.t("Test Sentry")}
                            </ListItemTitle>
                          </ListItem>
                        </YGroup.Item>
                      )}
                    </YGroup>
                  </Animated.View>
                )
              }
            </YStack>

          </ScrollView>
          {connectedAccount && (
            <Stack marginHorizontal="$4" gap="$3">
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
