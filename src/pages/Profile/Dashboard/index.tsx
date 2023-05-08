import type { FC } from "react";

import { useAccountState } from "@crossbell/react-account";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Clock, Eye, Heart, MessageSquare, Newspaper, UserCheck } from "@tamagui/lucide-icons";
import type { IconProps } from "@tamagui/lucide-icons/types/IconProps";
import { Card, H3, SizableText, XStack } from "tamagui";

import { useDate } from "@/hooks/use-date";
import { i18n } from "@/i18n";
import { useGetTips } from "@/models/site.model";
import type { RootStackParamList } from "@/navigation/types";
import { useGetStat } from "@/queries/site";

export interface Props {
}

export const DashboardPage: FC<NativeStackScreenProps<RootStackParamList, "Dashboard">> = () => {
  const { computed: { account: { characterId } } } = useAccountState();
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
      label: "发布的文章",
      value: stat.data?.notesCount,
      icon: Newspaper,
    },
    {
      label: "收到的评论",
      value: stat.data?.commentsCount,
      icon: MessageSquare,
    },
    {
      label: "收到的打赏",
      value: `${tips.data?.pages?.[0]?.list
        ?.map(i => +i.amount)
        .reduce((acr, cur) => acr + cur, 0) ?? 0
      } MIRA`,
      icon: Heart,
    },
    {
      label: "关注者",
      value: stat.data?.subscriptionCount,
      icon: UserCheck,
    },
    {
      label: "浏览量",
      value: stat.data?.viewsCount,
      icon: Eye,
    },
    {
      label: "站点运行时间",
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
