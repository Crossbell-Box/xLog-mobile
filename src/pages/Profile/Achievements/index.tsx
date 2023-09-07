import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

import { useCharacter } from "@crossbell/indexer";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowLeft, ArrowLeftFromLine, ArrowLeftToLine, ChevronLeft } from "@tamagui/lucide-icons";
import { H5, Spacer, Stack, Text, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import { Avatar } from "@/components/Avatar";
import { ProfilePageHeader } from "@/components/ProfilePageHeader";
import { ProfilePageLayout } from "@/components/ProfilePageLayout";
import { XTouch } from "@/components/XTouch";
import { useCharacterId } from "@/hooks/use-character-id";
import { useDate } from "@/hooks/use-date";
import type { RootStackParamList } from "@/navigation/types";
import { useGetAchievements } from "@/queries/site";

export interface Props {
  characterId?: number
}

export const AchievementsPage: FC<NativeStackScreenProps<RootStackParamList, "Achievements">> = (props) => {
  const { characterId: _characterId } = props.route.params;
  const myCharacterId = useCharacterId();
  const characterId = _characterId ?? myCharacterId;
  const i18n = useTranslation("common");
  const achievement = useGetAchievements(characterId?.toString());
  const character = useCharacter(characterId);
  const date = useDate();

  return (
    <ProfilePageLayout>
      <XStack alignItems="center">
        <XTouch hitSlopSize={44} onPress={props.navigation.goBack}>
          <ChevronLeft size={24}/>
        </XTouch>
        <Spacer size={"$2"}/>
        <Avatar character={character.data} size={32}/>
        <Spacer size={"$2"}/>
        <YStack>
          <Text color={"#DBDBDB"}>{`${character.data?.handle}\'s`} achievements</Text>
          <Text color={"#929190"}>join from {i18n.t("ago", {
            time: date.dayjs
              .duration(
                date.dayjs(character?.data?.createdAt).diff(date.dayjs(), "minute"),
                "minute",
              )
              .humanize(),
          })}</Text>
        </YStack>
      </XStack>
      {/* <ProfilePageHeader title={i18n.t("Achievements")} description={null} /> */}

      <Stack margin="$3">
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
                        characterId={myCharacterId}
                        isOwner
                      />
                    );
                  })
                }
              </XStack>
            </YStack>
          );
        })}
      </Stack>
    </ProfilePageLayout>
  );
};
