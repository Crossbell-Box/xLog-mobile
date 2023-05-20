import type { FC } from "react";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";

import { useCharacterNotification } from "@crossbell/indexer";
import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { NotificationItem } from "@/components/NotificationItem";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import type { RootStackParamList } from "@/navigation/types";

export interface Props {
}

export const NotificationsPage: FC<NativeStackScreenProps<RootStackParamList, "Notifications">> = () => {
  const { computed } = useAccountState();
  const characterId = computed?.account?.characterId;
  const notifications = useCharacterNotification(characterId, ["LINKED", "MENTIONED", "NOTE_MINTED", "NOTE_POSTED", "OPERATOR_ADDED", "OPERATOR_REMOVED", "TIPPED", "UNLINKED"]);

  return (
    <ProfilePageLayout>
      <ProfilePageHeader title="通知" description={null} />
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
