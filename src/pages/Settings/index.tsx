import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, ScrollView, Linking, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useIsConnected } from "@crossbell/react-account";
import { ArrowDownToLine, ArrowRight, Check, Cog, Copy, Eye, Info, Palette, TestTube, Thermometer, TrendingUp } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as Updates from "expo-updates";
import * as Sentry from "sentry-expo";
import { Text, ListItemTitle, YStack, Spinner } from "tamagui";

import { AlertDialog } from "@/components/AlertDialog";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Base/Button";
import { SettingsYGroup } from "@/components/Base/SettingsGroup";
import { SettingsListItem } from "@/components/Base/SettingsListItem";
import { Switch } from "@/components/Base/Switch";
import { BottomSheetModal } from "@/components/BottomSheetModal";
import type { BottomSheetModalInstance } from "@/components/BottomSheetModal";
import { APP_SCHEME, IS_DEV, IS_PROD, IS_TEST, VERSION } from "@/constants";
import { useColors } from "@/hooks/use-colors";
import { useDisconnect } from "@/hooks/use-disconnect";
import { useIsLogin } from "@/hooks/use-is-login";
import { useIsUpdatesAvailable } from "@/hooks/use-is-updates-available";
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
  const { primary, color, background } = useColors();
  const [devMenuVisible, setDevMenuVisible] = React.useState(false);
  const isLogin = useIsLogin();
  const isConnected = useIsConnected();
  const { disconnect } = useDisconnect();
  const updatesStatus = useIsUpdatesAvailable();
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
              <SettingsYGroup bordered>
                <SettingsYGroup.Item>
                  <SettingsListItem
                    icon={Thermometer}
                    scaleIcon={1.2}
                    iconAfter={() => (
                      <Switch checked={followSystem} size="$3" onCheckedChange={toggleFollowSystem}/>
                    )}
                  >
                    <ListItemTitle>
                      {i18n.t("Follow System")}
                    </ListItemTitle>
                  </SettingsListItem>
                </SettingsYGroup.Item>
                {
                  !followSystem && (
                    <SettingsYGroup.Item>
                      <SettingsListItem
                        icon={Eye}
                        scaleIcon={1.2}
                        iconAfter={() => {
                          return (
                            <Switch checked={isDarkMode} size="$3" onCheckedChange={toggleMode}/>
                          );
                        }}
                      >
                        <ListItemTitle>
                          {i18n.t("Dark Mode")}
                        </ListItemTitle>
                      </SettingsListItem>
                    </SettingsYGroup.Item>
                  )
                }

                <SettingsYGroup.Item>
                  <SettingsListItem
                    icon={Palette}
                    scaleIcon={1.2}
                    onPress={openBottomSheet}
                    iconAfter={<ArrowRight />}
                  >
                    <ListItemTitle>
                      {i18n.t("Theme")}
                    </ListItemTitle>
                  </SettingsListItem>
                </SettingsYGroup.Item>
                {
                  isLogin && (
                    <SettingsYGroup.Item>
                      <SettingsListItem
                        icon={Cog}
                        scaleIcon={1.2}
                        iconAfter={<ArrowRight />}
                        onPress={navigateToAdvancedPage}
                      >
                        <ListItemTitle>
                          {i18n.t("Advanced")}
                        </ListItemTitle>
                      </SettingsListItem>
                    </SettingsYGroup.Item>
                  )
                }
                <SettingsYGroup.Item>
                  <SettingsListItem
                    icon={Info}
                    scaleIcon={1.2}
                    iconAfter={(
                      updatesStatus.isLoading
                        ? <Spinner size="small"/>
                        : (
                          <Badge
                            size={5}
                            breathing={updatesStatus.isDownloading}
                            visible={updatesStatus.isUpdatesAvailable}
                            color={updatesStatus.isDownloaded ? primary : color}
                          >
                            <Text color="$color">{VERSION}</Text>
                          </Badge>
                        )
                    )}
                    onPress={handleMultiPress}
                  >
                    <ListItemTitle>
                      {i18n.t("Version")}
                    </ListItemTitle>
                  </SettingsListItem>
                </SettingsYGroup.Item>
              </SettingsYGroup>

              {
                ((devMenuVisible && IS_TEST) || IS_DEV) && (
                  <SettingsYGroup bordered>
                    <SettingsYGroup.Item>
                      <SettingsListItem
                        icon={Copy}
                        scaleIcon={1.2}
                        iconAfter={<ArrowRight />}
                        onPress={copyPushToken}
                      >
                        <ListItemTitle>
                          {i18n.t("Copy Push Token")}
                        </ListItemTitle>
                      </SettingsListItem>
                    </SettingsYGroup.Item>
                    <SettingsYGroup.Item>
                      <SettingsListItem
                        icon={TrendingUp}
                        scaleIcon={1.2}
                        iconAfter={<ArrowRight />}
                        onPress={testGA}
                      >
                        <ListItemTitle>
                          {i18n.t("Test GA")}
                        </ListItemTitle>
                      </SettingsListItem>
                    </SettingsYGroup.Item>
                    <SettingsYGroup.Item>
                      <SettingsListItem
                        icon={ArrowDownToLine}
                        scaleIcon={1.2}
                        iconAfter={<ArrowRight />}
                        onPress={checkUpdates}
                      >
                        <ListItemTitle>
                          {i18n.t("Check updates")}
                        </ListItemTitle>
                      </SettingsListItem>
                    </SettingsYGroup.Item>
                    {!IS_DEV && (
                      <SettingsYGroup.Item>
                        <SettingsListItem
                          icon={TestTube}
                          scaleIcon={1.2}
                          iconAfter={<ArrowRight />}
                          onPress={testSentry}
                        >
                          <ListItemTitle>
                            {i18n.t("Test Sentry")}
                          </ListItemTitle>
                        </SettingsListItem>
                      </SettingsYGroup.Item>
                    )}
                  </SettingsYGroup>
                )
              }

              {isConnected && (
                <SettingsYGroup bordered>
                  <SettingsYGroup.Item>
                    <SettingsListItem scaleIcon={1.2}>
                      <ListItemTitle fontSize={"$5"} textAlign="center" color={"#E65040"} onPress={disconnect} fontWeight={"700"}>
                        {i18n.t("Disconnect")}
                      </ListItemTitle>
                    </SettingsListItem>
                  </SettingsYGroup.Item>
                </SettingsYGroup>
              )}
            </YStack>
          </ScrollView>
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
              <SettingsYGroup bordered>
                {
                  allThemes.map(({ themeName, definitions }) => {
                    const t = definitions[mode];
                    const isChecked = theme.startsWith(themeName);
                    return (
                      <SettingsYGroup.Item key={themeName}>
                        <SettingsListItem
                          scaleIcon={1.2}
                          backgroundColor={t?.background}
                          onPress={() => changeTheme(themeName)}
                          iconAfter={isChecked && <Check color={t.primary} />}
                        >
                          <ListItemTitle color={t.primary}>
                            {themeName}
                          </ListItemTitle>
                        </SettingsListItem>
                      </SettingsYGroup.Item>
                    );
                  })
                }
              </SettingsYGroup>
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
