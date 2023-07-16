import React from "react";
import type { FC } from "react";
import { ScrollView } from "react-native";
import { Drawer as _Drawer } from "react-native-drawer-layout";
import { TouchableOpacity, TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountBalance, useAccountCharacter, useIsConnected } from "@crossbell/react-account";
import type { IconProps } from "@tamagui/helpers-icon";
import { Copy, Euro, File, Flag, LayoutDashboard, MessageSquare, Newspaper, PlusSquare, Trophy } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { H4, Separator, SizableText, Spacer, Stack, Text, useWindowDimensions, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { useColors } from "@/hooks/use-colors";
import { useDrawer } from "@/hooks/use-drawer";
import { useHomeNavigation, useRootNavigation } from "@/hooks/use-navigation";
import { i18n } from "@/i18n";
import type { ProfilePagesParamList } from "@/navigation/types";

import { ClaimCSBButton } from "../ClaimCSBButton";
import { XTouch } from "../XTouch";

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
];

const DrawerContent = () => {
  const { top, bottom } = useSafeAreaInsets();
  const character = useAccountCharacter();
  const accountBalance = useAccountBalance();
  const homeNavigation = useHomeNavigation();
  const rootNavigation = useRootNavigation();
  const { closeDrawer } = useDrawer();
  const balanceFormatted = accountBalance?.balance?.formatted;

  const copyOperator = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setStringAsync(character.operator);
  };

  const navigateToProfile = () => {
    closeDrawer();
    homeNavigation.navigate("Profile");
  };

  const navigate = (name: keyof ProfilePagesParamList) => {
    setTimeout(() => {
      closeDrawer();
    }, 600);

    rootNavigation.navigate(name);
  };

  return (
    <YStack paddingHorizontal="$4" paddingTop={top} paddingBottom={bottom} justifyContent={"space-between"} flex={1}>
      {character && (
        <YStack flex={1}>
          <Spacer size="$2" />
          <XStack gap="$3" alignItems="center">
            <XTouch onPress={navigateToProfile} enableHaptics touchableComponent={TouchableOpacity}>
              <Stack width={55} height={55}>
                {character && <Avatar useDefault isNavigateToUserInfo={false} size={55} character={character} />}
              </Stack>
            </XTouch>
            <YStack flex={1} gap="$-1.5">
              <H4>{character?.metadata?.content?.name}</H4>
              <SizableText numberOfLines={1} size={"$4"} color="$colorSubtitle">
                @{character?.handle}
              </SizableText>
            </YStack>
          </XStack>
          <Spacer size="$5" />
          <ScrollView>
            {
              profilePages?.map((page, index) => (
                <YStack onPress={() => navigate(page.name)} justifyContent="center" key={page.name} paddingHorizontal="$1">
                  <XStack gap="$3" paddingVertical="$4">
                    <page.icon size={"$1"} />
                    <Text fontSize={"$6"}>{page.title}</Text>
                  </XStack>
                  {index !== profilePages?.length - 1 && <Separator />}
                </YStack>
              ))
            }
          </ScrollView>
        </YStack>
      )}
      <YStack paddingHorizontal="$1">
        <ClaimCSBButton />
        <Spacer/>
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
