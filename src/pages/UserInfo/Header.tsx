import type { FC } from "react";
import React, { useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";

import { useCharacter } from "@crossbell/indexer";
import { useNavigationState } from "@react-navigation/native";
import { Award, Settings, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import * as Haptics from "expo-haptics";
import { Button, Circle, H3, Paragraph, Separator, SizableText, Stack, Text, XStack, YStack } from "tamagui";

import { AchievementItem } from "@/components/AchievementItem";
import { Avatar } from "@/components/Avatar";
import { PolarLightBackground } from "@/components/PolarLightBackground";
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

  const navigateToSettingsPage = useCallback(() => {
    navigation.navigate("SettingsNavigator");
  }, []);

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
                { label: i18n.t("Follower"), value: subscriptions.data?.pages?.[0]?.count ?? 0 },
                { label: i18n.t("Following"), value: toSubscriptions.data?.pages?.[0]?.count ?? 0 },
              ].map((item, index) => (
                <XStack key={index} width={"40%"}>
                  <YStack justifyContent="flex-end" alignItems="flex-start" flex={1}>
                    <SizableText numberOfLines={1} size={"$5"} fontWeight={"700"}>{item.value}</SizableText>
                    <SizableText numberOfLines={1} color="$colorSubtitle">{item.label}</SizableText>
                  </YStack>
                  {
                    index < 1 && <Separator marginLeft="$2" marginRight="$5" alignSelf="flex-end" vertical borderColor={"$colorSubtitle"} height={"$2"} marginBottom="$3" />
                  }
                </XStack>
              ))
            }
          </XStack>
        </XStack>
        <XStack justifyContent="space-between" alignItems="flex-start" minHeight={"$5"} marginBottom="$3">
          <YStack gap="$2">
            <H3 fontWeight={"700"}>{character.data?.metadata?.content?.name}</H3>
            <Paragraph color="#DBDBDB" numberOfLines={3} maxWidth={replaceFollowButtonWithOtherComponent ? "70%" : undefined}>
              {character?.data?.metadata?.content?.bio}
            </Paragraph>
          </YStack>
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
                            borderWidth={0}
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
      </YStack>
    </YStack>
  );
};
