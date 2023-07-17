import type { FC } from "react";
import React, { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, { Extrapolate, FadeIn, FadeOut, FlipInXDown, FlipOutXDown, interpolate, useAnimatedStyle } from "react-native-reanimated";

import { useCharacter } from "@crossbell/indexer";
import { useNavigationState } from "@react-navigation/native";
import { Award, Settings, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Button, Circle, H3, Paragraph, Separator, SizableText, Stack, Text, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import { Avatar } from "@/components/Avatar";
import { XTouch } from "@/components/XTouch";
import { useAuthPress } from "@/hooks/use-auth-press";
import { useCharacterId } from "@/hooks/use-character-id";
import { useDate } from "@/hooks/use-date";
import { useFollow } from "@/hooks/use-follow";
import { useRootNavigation } from "@/hooks/use-navigation";
import { useGetAchievements, useGetSiteSubscriptions, useGetSiteToSubscriptions, useGetStat } from "@/queries/site";

export interface Props {
  characterId: number
  titleAnimatedValue?: Animated.SharedValue<number>
  replaceFollowButtonWithOtherComponent?: React.ReactNode
}

export const Header: FC<Props> = (props) => {
  const { characterId, titleAnimatedValue, replaceFollowButtonWithOtherComponent } = props;
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
  const navigation = useRootNavigation();
  const currentRouteName = useNavigationState(state => state.routes[state.index].name);
  const displaySettingsEntry = useMemo(() => {
    const isMe = myCharacterId === characterId;
    const isProfilePage = currentRouteName === "Profile";

    return isMe && isProfilePage;
  }, [myCharacterId, characterId, currentRouteName]);

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

  const navigateToSettingsPage = useCallback(() => {
    navigation.navigate("SettingsNavigator");
  }, []);

  useEffect(() => {
    titleAnimatedValue && navigation.setOptions({
      headerShown: true,
      headerTitleContainerStyle: { overflow: "hidden" },
      headerTitle(props) {
        return (
          <Animated.View style={headerAnimatedStyles}>
            <Text numberOfLines={1} color={"$color"} fontSize={"$7"}>{character.data?.metadata?.content?.name}</Text>
          </Animated.View>
        );
      },
    });
  }, [titleAnimatedValue, headerAnimatedStyles]);

  return (
    <YStack paddingTop="$3">
      <YStack gap={"$3"}>
        <XStack gap={"$4"} paddingHorizontal="$2" pt="$2">
          <Circle width={55} height={55}>
            {character.data && <Avatar useDefault character={character.data} size={55} isNavigateToUserInfo={false} />}
          </Circle>
          <XStack gap={"$1"} flex={1}>
            {
              [
                { label: i18n.t("Followers"), value: subscriptions.data?.pages?.[0]?.count ?? 0 },
                { label: i18n.t("Followings"), value: toSubscriptions.data?.pages?.[0]?.count ?? 0 },
                { label: i18n.t("Viewed"), value: stat.data?.viewsCount ?? 0 },
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
        <XStack justifyContent="space-between" alignItems="center" minHeight={"$5"}>
          <H3 fontWeight={"700"}>{character.data?.metadata?.content?.name}</H3>
          {
            replaceFollowButtonWithOtherComponent || (
              <Stack>
                {
                  displaySettingsEntry
                    ? (
                      <XTouch enableHaptics touchableComponent={TouchableOpacity} onPress={navigateToSettingsPage}>
                        <Settings color={"$colorSubtitle"} size={"$1.5"}/>
                      </XTouch>
                    )
                    : (
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
                    )
                }
              </Stack>
            )
          }
        </XStack>
        <Paragraph color="$colorSubtitle" numberOfLines={3} maxWidth={replaceFollowButtonWithOtherComponent ? "70%" : undefined}>
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
