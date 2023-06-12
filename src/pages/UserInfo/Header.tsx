import type { FC } from "react";
import React from "react";
import { useTranslation } from "react-i18next";

import { useCharacter } from "@crossbell/indexer";
import { Award, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Button, Circle, H3, Paragraph, ScrollView, Separator, SizableText, Stack, Text, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import { Avatar } from "@/components/Avatar";
import { useAuthPress } from "@/hooks/use-auth-press";
import { useDate } from "@/hooks/use-date";
import { useFollow } from "@/hooks/use-follow";
import { useGetAchievements, useGetSite, useGetSiteSubscriptions, useGetSiteToSubscriptions, useGetStat } from "@/queries/site";

export interface Props {
  characterId: number
}

export const Header: FC<Props> = (props) => {
  const { characterId } = props;
  const character = useCharacter(characterId);
  const stat = useGetStat({ characterId: characterId?.toString() });
  const i18n = useTranslation();
  const subscriptions = useGetSiteSubscriptions({ characterId });
  const toSubscriptions = useGetSiteToSubscriptions({ characterId });
  const { isFollowing, isLoading, toggleSubscribe } = useFollow({ character: character?.data });
  const achievement = useGetAchievements(characterId?.toString());
  const date = useDate();
  const handleToggleSubscribe = useAuthPress(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSubscribe();
  });

  return (
    <YStack paddingTop="$3">
      <YStack gap={"$3"}>
        <XStack gap={"$6"}>
          <Circle width={65} height={65}>
            {character.data && <Avatar useDefault character={character.data} size={65} isNavigateToUserInfo={false} />}
          </Circle>
          <XStack gap={"$2"} flex={1}>
            {
              [
                { label: i18n.t("Followers"), value: subscriptions.data?.pages?.[0]?.count || 0 },
                { label: i18n.t("Followings"), value: toSubscriptions.data?.pages?.[0]?.count || 0 },
                { label: i18n.t("Viewed"), value: stat.data?.viewsCount },
              ].map((item, index) => (
                <XStack key={index} flex={1}>
                  <YStack justifyContent="flex-end" alignItems="center" flex={1}>
                    <SizableText fontWeight={"700"}>{item.value}</SizableText>
                    <SizableText numberOfLines={1} color="$colorSubtitle">{item.label}</SizableText>
                  </YStack>
                  {
                    index < 2 && <Separator marginHorizontal="$2.5" alignSelf="flex-end" vertical borderColor={"$colorSubtitle"} height={"$0.75"} marginBottom="$4" />
                  }
                </XStack>
              ))
            }
          </XStack>
        </XStack>
        <XStack justifyContent="space-between" alignItems="center">
          <H3 fontWeight={"700"}>{character.data?.metadata?.content?.name}</H3>
          <XStack>
            <Button
              size={"$3"}
              backgroundColor={isFollowing ? "$backgroundFocus" : "$primary"}
              icon={isFollowing
                ? (
                  <UserMinus width={16} disabled={isLoading} />
                )
                : (
                  <UserPlus size={16} disabled={isLoading} />
                )}
              onPress={handleToggleSubscribe}
            >
              {
                isFollowing ? i18n.t("Unfollow") : i18n.t("Follow")
              }
            </Button>
          </XStack>
        </XStack>
        <Paragraph color="#BEBEBE" numberOfLines={3}>
          {character?.data?.metadata?.content?.bio}
        </Paragraph>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center">
            <Award size={"$0.75"} color="#BEBEBE" />
            <Text fontSize={"$2"} color="#BEBEBE" marginRight="$2">
              {i18n.t("Earned badges")}
            </Text>
            <XStack>
              {achievement.data?.list?.flatMap(series => series.groups || [])
                .filter(group => group.items.filter(item => item.status === "MINTED").length > 0)
                .slice(0, 3)
                .map((group, index) => (
                  <Stack key={group.info.name} zIndex={index} transform={[{ translateX: index > 0 ? -index * 5 : 0 }]}>
                    <AchievementItem
                      group={group}
                      layoutId="achievements"
                      size={15}
                      characterId={characterId}
                      isOwner
                    />
                  </Stack>
                ))
              }
            </XStack>
          </XStack>

          <SizableText fontSize={"$2"} color="#BEBEBE">
            {i18n.t("joined ago", {
              time: date.dayjs
                .duration(
                  date.dayjs(character?.data?.createdAt).diff(date.dayjs(), "minute"),
                  "minute",
                )
                .humanize(),
            })}
          </SizableText>
        </XStack>
      </YStack>
    </YStack>
  );
};
