import type { FC } from "react";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { H5, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import type { RootStackParamList } from "@/navigation/types";
import { useGetAchievements } from "@/queries/site";

export interface Props {
}

export const AchievementsPage: FC<NativeStackScreenProps<RootStackParamList, "Achievements">> = () => {
  const { computed: { account } } = useAccountState();
  const { characterId } = account;
  const achievement = useGetAchievements(characterId?.toString());

  return (
    <YStack flex={1} padding="$4">
      {achievement.data?.list?.map((series) => {
        const length = series.groups?.length;
        if (!length) {
          return null;
        }
        return (
          <YStack key={series.info.name} marginBottom="$4">
            <H5 marginBottom="$2">
              {series.info.title}
            </H5>
            <XStack flexWrap="wrap" gap="$4">
              {
                series.groups?.map((group) => {
                  return (
                    <AchievementItem
                      group={group}
                      key={group.info.name}
                      layoutId="achievements"
                      size={80}
                      characterId={characterId}
                      isOwner
                    />
                  );
                })
              }
            </XStack>
          </YStack>
        );
      })}
    </YStack>
  );
};
