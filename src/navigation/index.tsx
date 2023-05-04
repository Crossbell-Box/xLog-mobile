import React from "react";
import type { FC } from "react";
import { Drawer as _Drawer } from "react-native-drawer-layout";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountBalance, useAccountCharacter, useConnectedAccount, useIsConnected } from "@crossbell/react-account";
import { useNavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Copy, Euro, LayoutDashboard } from "@tamagui/lucide-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { H4, ListItem, SizableText, Spacer, Stack, Text, useWindowDimensions, XStack, YGroup, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { useColors } from "@/hooks/use-color";
import { PostDetailsPage } from "@/pages/PostDetails";

import { HomeNavigator } from "./home";
import type { RootStackParamList } from "./types";

const RootStack = createStackNavigator<RootStackParamList>();

const DrawerContent = () => {
  const { top, bottom } = useSafeAreaInsets();
  const connectedAccount = useConnectedAccount();
  const character = useAccountCharacter();
  const accountBalance = useAccountBalance();
  const balanceFormatted = accountBalance?.balance?.formatted;

  const copyOperator = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setStringAsync(character.operator);
  };

  return (
    <YStack paddingHorizontal="$4" paddingTop={top} paddingBottom={bottom} justifyContent={"space-between"} flex={1}>
      {character && (
        <YStack flex={1}>
          <Spacer size="$2" />
          {/* Userinfo */}
          <XStack gap="$3" alignItems="center">
            <Stack width={45} height={40}>
              {character && <Avatar size={45} uri={character?.metadata?.content?.avatars?.[0]} />}
            </Stack>
            <YStack flex={1} gap="$-1.5">
              <H4>{character?.metadata?.content?.name}</H4>
              <SizableText numberOfLines={1} size={"$xs"} color="$colorSubtitle">
                @{character.handle}
              </SizableText>
            </YStack>
          </XStack>
          <Spacer size="$10" />
          {/* Dashboard */}
          <YGroup alignSelf="center" bordered size="$4">
            <YGroup.Item>
              <ListItem hoverTheme icon={LayoutDashboard}>
                仪表盘
              </ListItem>
            </YGroup.Item>
          </YGroup>
        </YStack>
      )}
      <YStack>
        <XStack alignItems="center" gap="$1.5" justifyContent="space-between">
          {character && (
            <TouchableWithoutFeedback onPress={copyOperator}>
              <XStack alignItems="center" gap="$1.5">
                <Copy size={"$1"} color={"$colorSubtitle"} />
                <Text color={"$colorSubtitle"} >
                  {character.operator.slice(0, 5)}...{character.operator.slice(-4)}
                </Text>
              </XStack>
            </TouchableWithoutFeedback>
          )}
          {balanceFormatted && (
            <XStack alignItems="center" gap="$1.5">
              <Euro size={"$1"} color={"$colorSubtitle"} />
              <Text color={"$colorSubtitle"} numberOfLines={1}>
                {balanceFormatted}
              </Text>
            </XStack>
          )}
        </XStack>
        <Spacer size="$5" />
        {connectedAccount && <DisconnectBtn />}
      </YStack>
    </YStack>
  );
};

const Drawer: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { width } = useWindowDimensions();
  const { borderColor, background } = useColors();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const isConnected = useIsConnected();
  const currentRouteName = useNavigationState((state) => {
    return state ? state.routes[state.index].name : "Home";
  });

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <_Drawer
      swipeEnabled={
        currentRouteName === "Home"
        && isConnected
      } // Allow swipe to open drawer only on `Home` page.
      open={isDrawerOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      onGestureCancel={closeDrawer}
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

export const RootNavigator = () => {
  return (
    <Drawer>
      <RootStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name={"Home"} component={HomeNavigator} />
        <RootStack.Screen name={"PostDetails"} component={PostDetailsPage} />
      </RootStack.Navigator>
    </Drawer>
  );
};
