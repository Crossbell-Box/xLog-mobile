import React, { useMemo, useRef } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ArrowRight, Check, Eye, Info, Palette, Thermometer } from "@tamagui/lucide-icons";
import * as Application from "expo-application";
import { ListItem, Text, ListItemTitle, Switch, YGroup, YStack } from "tamagui";

import { useColors } from "@/hooks/use-color";
import { useThemeStore } from "@/hooks/use-theme-store";
import { allThemes } from "@/styles/theme";

export interface Props {

}

export const Settings: React.FC<Props> = () => {
  const { primary, backgroundFocus } = useColors();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { mode, theme, changeTheme } = useThemeStore();
  const snapPoints = useMemo(() => ["40%"], []);
  const { toggleMode, toggleFollowSystem, followSystem, isDarkMode } = useThemeStore();

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  return (
    <SafeAreaView style={styles.container}>
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
                  跟随主题
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
                    深色模式
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
                  更换主题
                </ListItemTitle>
              </ListItem>
            </YGroup.Item>
            <YGroup.Item>
              <ListItem
                icon={Info}
                scaleIcon={1.2}
                onPress={openBottomSheet}
                iconAfter={<Text color="$color">{Application.nativeApplicationVersion}</Text>}
              >
                <ListItemTitle>
                  版本
                </ListItemTitle>
              </ListItem>
            </YGroup.Item>
          </YGroup>
        </YStack>
      </ScrollView>
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={0}
        backgroundStyle={{
          backgroundColor: backgroundFocus,
        }}

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
