import React from "react";
import type { FC } from "react";
import { ScrollView } from "react-native";
import { Drawer as _Drawer } from "react-native-drawer-layout";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountBalance, useAccountCharacter, useConnectedAccount, useIsConnected } from "@crossbell/react-account";
import { Copy, Euro, File, Flag, LayoutDashboard, MessageSquare, Newspaper, TreeDeciduous, Trophy } from "@tamagui/lucide-icons";
import type { IconProps } from "@tamagui/lucide-icons/types/IconProps";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { H4, ListItem, Separator, SizableText, Spacer, Stack, Text, useWindowDimensions, XStack, YGroup, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { useColors } from "@/hooks/use-colors";
import { useDrawer } from "@/hooks/use-drawer";
import { useRootNavigation } from "@/hooks/use-navigation";
import { i18n } from "@/i18n";
import type { ProfilePagesParamList } from "@/navigation/types";

const profilePages: Array<{
  name: keyof ProfilePagesParamList
  title: string
  icon: React.ExoticComponent<IconProps>
}> = [
  { name: "Dashboard", title: i18n.t("Dashboard"), icon: LayoutDashboard },
  { name: "Posts", title: i18n.t("Posts"), icon: Newspaper },
  { name: "Pages", title: i18n.t("Pages"), icon: File },
  { name: "Comments", title: i18n.t("Comment"), icon: MessageSquare },
  { name: "Achievements", title: i18n.t("Achievements"), icon: Trophy },
  { name: "Events", title: i18n.t("Events"), icon: Flag },
  { name: "Notifications", title: i18n.t("Notifications"), icon: TreeDeciduous },
];

const DrawerContent = () => {
  const { top, bottom } = useSafeAreaInsets();
  const connectedAccount = useConnectedAccount();
  const character = useAccountCharacter();
  const accountBalance = useAccountBalance();
  const navigation = useRootNavigation();
  const balanceFormatted = accountBalance?.balance?.formatted;
  const { closeDrawer } = useDrawer();

  const copyOperator = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setStringAsync(character.operator);
  };

  const onNavigate = (name: keyof ProfilePagesParamList) => {
    navigation.navigate(name);
    setTimeout(() => {
      closeDrawer();
    }, 600);
  };

  return (
    <YStack paddingHorizontal="$4" paddingTop={top} paddingBottom={bottom} justifyContent={"space-between"} flex={1}>
      {character && (
        <YStack flex={1}>
          <Spacer size="$2" />
          {/* Userinfo */}
          <XStack gap="$3" alignItems="center">
            <Stack width={45} height={40}>
              {character && <Avatar size={45} character={character} />}
            </Stack>
            <YStack flex={1} gap="$-1.5">
              <H4>{character?.metadata?.content?.name}</H4>
              <SizableText numberOfLines={1} size={"$4"} color="$colorSubtitle">
                @{character.handle}
              </SizableText>
            </YStack>
          </XStack>
          <Spacer size="$10" />

          <ScrollView>
            <YGroup separator={<Separator />} gap="$2">
              {
                profilePages.map(page => (
                  <YGroup.Item key={page.name}>
                    <ListItem size={"$5"} onPress={() => onNavigate(page.name)} icon={page.icon}>{page.title}</ListItem>
                  </YGroup.Item>
                ))
              }
            </YGroup>
          </ScrollView>
        </YStack>
      )}
      <YStack>
        <XStack alignItems="center" justifyContent="space-between">
          {character && (
            <XStack width={"49%"}>
              <TouchableWithoutFeedback onPress={copyOperator}>
                <XStack alignItems="center" gap="$1.5" >
                  <Copy size={"$1"} color={"$colorSubtitle"} />
                  <Text color={"$colorSubtitle"} >
                    {character.operator.slice(0, 5)}...{character.operator.slice(-4)}
                  </Text>
                </XStack>
              </TouchableWithoutFeedback>
            </XStack>
          )}
          {balanceFormatted && (
            <XStack alignItems="center" justifyContent="flex-end" gap="$1.5" width={"49%"}>
              <Euro size={"$1"} color={"$colorSubtitle"} />
              <Text color={"$colorSubtitle"} numberOfLines={1}>
                {balanceFormatted}
              </Text>
            </XStack>
          )}
        </XStack>
        <Spacer size="$5" />
        {connectedAccount && <DisconnectBtn navigateToLogin={false} />}
      </YStack>
    </YStack>
  );
};

export const Drawer: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { width } = useWindowDimensions();
  const { borderColor, background } = useColors();
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const isConnected = useIsConnected();

  return (
    <_Drawer
      swipeEnabled={isConnected} // Allow swipe to open drawer only on `Home` page.
      open={isDrawerOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      onGestureCancel={closeDrawer}
      swipeEdgeWidth={width}
      drawerStyle={{
        width: width * 0.8,
        borderRightColor: borderColor,
        borderRightWidth: 1,
        backgroundColor: background,
      }}
      renderDrawerContent={DrawerContent}
    >
      {children}
    </_Drawer>
  );
};
