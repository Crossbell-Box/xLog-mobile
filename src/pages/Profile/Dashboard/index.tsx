import type { FC } from "react";
import { useTranslation } from "react-i18next";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { IconProps } from "@tamagui/helpers-icon";
import { Clock, Eye, Heart, MessageSquare, Newspaper, UserCheck } from "@tamagui/lucide-icons";
import { Card, H3, SizableText, XStack } from "tamagui";

import { useCharacterId } from "@/hooks/use-character-id";
import { useDate } from "@/hooks/use-date";
import { useGetTips } from "@/models/site.model";
import type { RootStackParamList } from "@/navigation/types";
import { useGetStat } from "@/queries/site";

export interface Props {
}

export const DashboardPage: FC<NativeStackScreenProps<RootStackParamList, "Dashboard">> = () => {
  const i18n = useTranslation();
  const characterId = useCharacterId();
  const stat = useGetStat({ characterId: characterId.toString() });
  const date = useDate();
  const tips = useGetTips({
    toCharacterId: characterId,
    limit: 1000,
  });

  const cards: Array<{
    label: string
    value: string | number
    icon: React.ExoticComponent<IconProps>
  }> = [
    {
      label: i18n.t("Published posts"),
      value: stat.data?.notesCount,
      icon: Newspaper,
    },
    {
      label: i18n.t("Received comments"),
      value: stat.data?.commentsCount,
      icon: MessageSquare,
    },
    {
      label: i18n.t("Received tips"),
      value: `${tips.data?.pages?.[0]?.list
        ?.map(i => +i.amount)
        .reduce((acr, cur) => acr + cur, 0) ?? 0
      } MIRA`,
      icon: Heart,
    },
    {
      label: i18n.t("Followers"),
      value: stat.data?.subscriptionCount,
      icon: UserCheck,
    },
    {
      label: i18n.t("Viewed"),
      value: stat.data?.viewsCount,
      icon: Eye,
    },
    {
      label: i18n.t("Site Duration"),
      value:
          `${date.dayjs().diff(date.dayjs(stat.data?.createdAt), "day")} ${i18n.t("days")}`,
      icon: Clock,
    },
  ];

  return (
    <XStack padding="$3" flexWrap="wrap" justifyContent="space-between">
      {
        cards.map((card, index) => {
          const Icon = card.icon;
          return (
            // TODO: Link to the corresponding page
            <Card padding="$1.5" marginBottom="$3" width={"48%"} elevate size="$2" bordered key={index} backgroundColor="$backgroundPress">
              <Card.Header padded>
                <XStack alignItems="center" gap="$1.5" marginBottom="$2">
                  <Icon width={16} />
                  <SizableText color="$color">{card.label}</SizableText>
                </XStack>
                <H3>{card.value}</H3>
              </Card.Header>
              <Card.Footer padded>
                <XStack flex={1} />
              </Card.Footer>
            </Card>
          );
        })
      }
    </XStack>
  );
};
