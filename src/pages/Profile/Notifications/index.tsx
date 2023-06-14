import type { ComponentPropsWithRef, FC } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCharacterNotification } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { NotificationItem } from "@/components/NotificationItem";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { useCharacterId } from "@/hooks/use-character-id";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
}

const NotificationsPage: FC<NativeStackScreenProps<RootStackParamList, "Notifications">> = () => {
  const characterId = useCharacterId();
  const { t } = useTranslation("dashboard");
  const notifications = useCharacterNotification(characterId, ["LINKED", "MENTIONED", "NOTE_MINTED", "NOTE_POSTED", "OPERATOR_ADDED", "OPERATOR_REMOVED", "TIPPED", "UNLINKED"]);

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title={t("Notifications")} description={null} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {
          notifications?.data?.pages.map((page) => {
            return page.list.map((item) => {
              return (
                <NotificationItem notification={item} key={item.transactionHash} />
              );
            });
          })
        }
      </ScrollView>
    </ProfilePageLayout>
  );
};

export const NotificationsPageWithModal = NotificationsPage;
export const NotificationsPageWithBottomTab = (props: ComponentPropsWithRef<typeof NotificationsPage>) => <SafeAreaView edges={["top"]} style={styles.safeArea}><NotificationsPage {...props} /></SafeAreaView>;

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: 16,
  },
  safeArea: {
    flex: 1,
  },
});
