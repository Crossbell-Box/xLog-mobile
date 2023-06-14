import type { FC } from "react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";

import { useCharacter } from "@crossbell/indexer";
import { useNavigation } from "@react-navigation/native";
import { Award, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Button, Circle, H3, Paragraph, Separator, SizableText, Stack, Text, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import { Avatar } from "@/components/Avatar";
import { useAuthPress } from "@/hooks/use-auth-press";
import { useCharacterId } from "@/hooks/use-character-id";
import { useDate } from "@/hooks/use-date";
import { useFollow } from "@/hooks/use-follow";
import { useGetAchievements, useGetSiteSubscriptions, useGetSiteToSubscriptions, useGetStat } from "@/queries/site";

export interface Props {
  characterId: number
  titleAnimatedValue?: Animated.SharedValue<number>
}

export const Header: FC<Props> = (props) => {
  const { characterId, titleAnimatedValue } = props;
  const character = useCharacter(characterId);
  const stat = useGetStat({ characterId: characterId?.toString() });
  const i18n = useTranslation();
  const myCharacterId = useCharacterId();
  const subscriptions = useGetSiteSubscriptions({ characterId });
  const toSubscriptions = useGetSiteToSubscriptions({ characterId });
  const { isFollowing, isLoading, toggleSubscribe } = useFollow({ character: character?.data });
  const achievement = useGetAchievements(characterId?.toString());
  const date = useDate();
  const handleToggleSubscribe = useAuthPress(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSubscribe();
  });

  const navigation = useNavigation();

  const headerAnimatedStyles = useAnimatedStyle(() => {
    if (!titleAnimatedValue) return {};
    return {
      opacity: interpolate(titleAnimatedValue.value, [-80, -140], [0, 1]),
      transform: [
        {
          translateY: interpolate(titleAnimatedValue.value, [-80, -140], [40, 0], Extrapolate.CLAMP),
        },
      ],
    };
  }, [titleAnimatedValue]);

  useEffect(() => {
    titleAnimatedValue && navigation.setOptions({
      headerShown: true,
      headerTitleContainerStyle: { overflow: "hidden" },
      headerTitle(props) {
        return (
          <Animated.View style={headerAnimatedStyles}>
            <Text numberOfLines={1} color={props.tintColor} fontSize={"$7"}>{character.data?.metadata?.content?.name}</Text>
          </Animated.View>
        );
      },
    });
  }, [titleAnimatedValue, headerAnimatedStyles]);

  return (
    <YStack paddingTop="$3">
      <YStack gap={"$3"}>
        <XStack gap={"$4"}>
          <Circle width={65} height={65}>
            {character.data && <Avatar useDefault character={character.data} size={65} isNavigateToUserInfo={false} />}
          </Circle>
          <XStack gap={"$1"} flex={1}>
            {
              [
                { label: i18n.t("Followers"), value: subscriptions.data?.pages?.[0]?.count || 0 },
                { label: i18n.t("Followings"), value: toSubscriptions.data?.pages?.[0]?.count || 0 },
                { label: i18n.t("Viewed"), value: stat.data?.viewsCount },
              ].map((item, index) => (
                <XStack key={index} flex={1}>
                  <YStack justifyContent="flex-end" alignItems="center" flex={1}>
                    <SizableText numberOfLines={1} size={"$5"} fontWeight={"700"}>{item.value}</SizableText>
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
          {
            myCharacterId !== characterId && (
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
                  color={"white"}
                >
                  {
                    isFollowing ? i18n.t("Unfollow") : i18n.t("Follow")
                  }
                </Button>
              </XStack>
            )
          }
        </XStack>
        <Paragraph color="$colorSubtitle" numberOfLines={3}>
          {character?.data?.metadata?.content?.bio}
        </Paragraph>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center">
            <Award size={"$0.75"} color="$colorSubtitle" />
            <Text fontSize={"$2"} color="$colorSubtitle" marginRight="$2">
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

          <SizableText fontSize={"$2"} color="$colorSubtitle">
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
