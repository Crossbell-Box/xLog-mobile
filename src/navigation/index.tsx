import React from "react";
import type { FC } from "react";
import { ScrollView } from "react-native";
import { Drawer as _Drawer } from "react-native-drawer-layout";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAccountBalance, useAccountCharacter, useConnectedAccount, useIsConnected } from "@crossbell/react-account";
import { useNavigationState } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Copy, Euro, File, Flag, LayoutDashboard, MessageSquare, Newspaper, TreeDeciduous, Trophy } from "@tamagui/lucide-icons";
import type { IconProps } from "@tamagui/lucide-icons/types/IconProps";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { H4, ListItem, Separator, SizableText, Spacer, Stack, Text, useWindowDimensions, XStack, YGroup, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { DisconnectBtn } from "@/components/ConnectionButton";
import { useColors } from "@/hooks/use-color";
import { useDrawer } from "@/hooks/use-drawer";
import { useRootNavigation } from "@/hooks/use-navigation";
import { PostDetailsPage } from "@/pages/PostDetails";
import { AchievementsPage } from "@/pages/Profile/Achievements";
import { CommentsPage } from "@/pages/Profile/Comments";
import { DashboardPage } from "@/pages/Profile/Dashboard";
import { EventsPage } from "@/pages/Profile/Events";
import { NotificationsPage } from "@/pages/Profile/Notifications";
import { PagesPage } from "@/pages/Profile/Pages";
import { PostsPage } from "@/pages/Profile/Posts";

import { HomeNavigator } from "./home";
import type { ProfilePagesParamList, RootStackParamList } from "./types";

const RootStack = createStackNavigator<RootStackParamList>();

const profilePages: Array<{
  name: keyof ProfilePagesParamList
  title: string
  icon: React.ExoticComponent<IconProps>
}> = [
  { name: "Dashboard", title: "仪表盘", icon: LayoutDashboard },
  { name: "Posts", title: "文章", icon: Newspaper },
  { name: "Pages", title: "页面", icon: File },
  { name: "Comments", title: "评论", icon: MessageSquare },
  { name: "Achievements", title: "成就", icon: Trophy },
  { name: "Events", title: "活动", icon: Flag },
  { name: "Notifications", title: "通知", icon: TreeDeciduous },
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
    closeDrawer();
    navigation.navigate(name);
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

          <ScrollView>
            <YGroup separator={<Separator />} gap="$2">
              {
                profilePages.map(page => (
                  <YGroup.Item key={page.name}>
                    <ListItem onPress={() => onNavigate(page.name)} hoverTheme icon={page.icon}>{page.title}</ListItem>
                  </YGroup.Item>
                ))
              }
            </YGroup>
          </ScrollView>
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
  const { isDrawerOpen, openDrawer, closeDrawer } = useDrawer();
  const isConnected = useIsConnected();
  const currentRouteName = useNavigationState((state) => {
    return state ? state.routes[state.index].name : "Home";
  });

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
  const { top, bottom } = useSafeAreaInsets();
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

        {/* Profile */}
        <RootStack.Group screenOptions={{
          headerShown: false,
          cardStyle: { paddingTop: top, paddingBottom: bottom },
          transitionSpec: {
            open: {
              animation: "timing",
              config: { duration: 0 },
            },
            close: {
              animation: "timing",
              config: { duration: 250 },
            },
          },
        }}>
          <RootStack.Screen name={"Dashboard"} component={DashboardPage} options={{ title: "仪表盘" }} />
          <RootStack.Screen name={"Posts"} component={PostsPage} options={{ title: "文章" }} />
          <RootStack.Screen name={"Pages"} component={PagesPage} options={{ title: "页面" }} />
          <RootStack.Screen name={"Comments"} component={CommentsPage} options={{ title: "评论" }} />
          <RootStack.Screen name={"Achievements"} component={AchievementsPage} options={{ title: "成就" }} />
          <RootStack.Screen name={"Events"} component={EventsPage} options={{ title: "活动" }} />
          <RootStack.Screen name={"Notifications"} component={NotificationsPage} options={{ title: "通知" }} />
        </RootStack.Group>
      </RootStack.Navigator>
    </Drawer>
  );
};
