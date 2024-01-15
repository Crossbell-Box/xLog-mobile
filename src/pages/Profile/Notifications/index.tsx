import type { ComponentPropsWithRef, FC } from "react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { indexer } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import type { IconProps } from "@tamagui/helpers-icon";
import { AtSign, MessageSquare, ThumbsUp } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Separator, SizableText, Spinner, Stack, XStack, YStack } from "tamagui";

import { FillSpinner } from "@/components/FillSpinner";
import { NotificationItem } from "@/components/NotificationItem";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { XTouch } from "@/components/XTouch";
import { useCharacterId } from "@/hooks/use-character-id";
import type { CharacterNotificationType } from "@/hooks/use-character-notification";
import { useCharacterNotification } from "@/hooks/use-character-notification";
import { useHomeNavigation } from "@/hooks/use-navigation";
import { useNotification } from "@/hooks/use-notification";
import { i18n } from "@/i18n";
import type { RootStackParamList } from "@/navigation/types";
import { GA } from "@/utils/GA";

export interface Props {
}

const tabs: Array<{
  key: CharacterNotificationType
  icon: FC<IconProps>
  label: string
}> = [
  {
    key: "LIKED",
    icon: ThumbsUp,
    label: i18n.t("Likes and Follows"),
  },
  {
    key: "COMMENTED",
    icon: MessageSquare,
    label: i18n.t("Comments"),
  },
  {
    key: "MENTIONED",
    icon: AtSign,
    label: i18n.t("Mentions"),
  },
];

const NotificationsPage: FC<NativeStackScreenProps<RootStackParamList, "Notifications">> = () => {
  const characterId = useCharacterId();
  const i18nT = useTranslation("translation");
  const i18nC = useTranslation("common");
  const [activeTab, setActiveTab] = React.useState<CharacterNotificationType>(tabs[0].key);
  const [containerHeight, setContainerHeight] = React.useState(0);
  const notifications = useCharacterNotification(characterId, activeTab);
  const data = notifications?.data?.pages?.flatMap(page => page?.list) || [];
  const { setOptions } = useHomeNavigation();
  const { clearBadgeCount } = useNotification();

  useEffect(() => {
    indexer.notification
      .markAllAsRead(characterId)
      .then(() => notifications?.refetch())
      .then(() => clearBadgeCount())
      .then(() => {
        setOptions({
        // @ts-expect-error
          tabBarBadge: undefined,
        });
      });
  }, [characterId]);

  const onTabChange = (tab: CharacterNotificationType) => {
    GA.logEvent("change_notification_tab", {
      tab,
    });
    setActiveTab(tab);
  };

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title={i18nT.t("Notifications")} description={null} />
      <Stack flex={1} onLayout={(e) => {
        setContainerHeight(e.nativeEvent.layout.height);
      }}>
        <FlashList
          data={data}
          keyExtractor={item => item.transactionHash?.toString?.()}
          ListEmptyComponent={(
            <Stack minHeight={containerHeight - 50}>
              {
                notifications.isFetching
                  ? <FillSpinner/>
                  : (
                    <Stack flex={1} alignItems="center" justifyContent="center">
                      <SizableText color={"$colorSubtitle"}>
                        {i18nC.t("There are no notifications yet.")}
                      </SizableText>
                    </Stack>
                  )
              }
            </Stack>
          )}
          ListHeaderComponent={(
            <XStack alignItems="center" marginBottom="$3">
              {
                tabs.map((tab, index) => {
                  const isActive = activeTab === tab.key;
                  const color = isActive ? "$primary" : "$color";

                  return (
                    <React.Fragment key={tab.key}>
                      <XTouch enableHaptics touchableComponent={TouchableOpacity} onPress={() => onTabChange(tab.key)} containerStyle={{ flex: 1 }}>
                        <YStack alignItems="center" flex={1} gap={4}>
                          <tab.icon color={color}/>
                          <SizableText color={color} size="$3">{tab.label}</SizableText>
                        </YStack>
                      </XTouch>
                      {index !== tabs.length - 1 && <Separator borderColor={"$gray5"} vertical height={"50%"}/>}
                    </React.Fragment>
                  );
                })
              }
            </XStack>
          )}
          renderItem={({ item }) => <NotificationItem tabType={activeTab} notification={item} />}
          ListFooterComponent={notifications.isFetchingNextPage && <Spinner paddingVertical="$5"/>}
          estimatedItemSize={100}
          scrollEventThrottle={16}
          bounces
          contentContainerStyle={{ padding: 8 }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (
              data.length === 0
            || notifications.isFetchingNextPage
            || notifications.hasNextPage === false
            )
              return;

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            notifications?.fetchNextPage?.();
          }}
        />
      </Stack>
    </ProfilePageLayout>
  );
};

// TODO
export const NotificationsPageWithModal = NotificationsPage;
export const NotificationsPageWithBottomTab = NotificationsPage;
