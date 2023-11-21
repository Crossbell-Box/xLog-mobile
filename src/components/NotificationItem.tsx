import React, { useCallback } from "react";
import type { UseTranslationResponse } from "react-i18next";
import { useTranslation } from "react-i18next";
import type { SvgProps } from "react-native-svg";
import { ClipPath, Rect, G, Svg, Path, Defs } from "react-native-svg";

import type { ParsedNotification } from "@crossbell/indexer";
import { indexer, Indexer } from "@crossbell/indexer";
import type { NoteEntity } from "crossbell";
import dayjs from "dayjs";
import removeMd from "remove-markdown";
import { Card, Circle, Text, XStack, YStack } from "tamagui";
import { formatUnits } from "viem";

import type { CharacterNotificationType } from "@/hooks/use-character-notification";
import { useDate } from "@/hooks/use-date";
import { GA } from "@/utils/GA";

import { Avatar } from "./Avatar";

export const CrossbellChainLogo: React.FC<SvgProps> = props => (
  <Svg
    width={20}
    height={20}
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <G clipPath="url(#clip0_1030_5486)">
      <Path
        fill="currentColor"
        d="M12.8444 18.4185C12.8444 19.292 11.5709 20 10 20C8.42915 20 7.15491 19.292 7.15491 18.4185H12.8444Z"
      />
      <Path
        fill="currentColor"
        d="M7.74317 7.8273L3.12109 8.70508C3.12109 3.8976 5.94982 0 9.43955 0L9.41103 6.32202L7.74317 7.8273Z"
      />
      <Path
        fill="currentColor"
        d="M9.17857 11.0255L8.92971 13.6439L8.59172 17.2028C8.56391 17.2071 8.53538 17.2099 8.50686 17.2128C7.37238 17.3312 5.78082 16.9703 4.19212 16.151C2.27184 15.1592 0.891347 13.7751 0.560486 12.6413C1.04525 12.6043 1.51472 12.4549 1.93171 12.2049C2.50786 11.8719 2.93427 11.4206 3.13322 10.987C3.16147 10.9258 3.1853 10.8627 3.20452 10.7981C3.25558 10.6455 3.26975 10.483 3.24588 10.3239L7.73818 9.58301L9.17857 11.0255Z"
      />
      <Path
        fill="currentColor"
        d="M12.2547 7.8273L16.8768 8.70508C16.8789 3.8976 14.0495 0 10.5605 0L10.589 6.32202L12.2547 7.8273Z"
      />
      <Path
        fill="currentColor"
        d="M10.8215 11.0255L11.0703 13.6439L11.4083 17.2028C11.4361 17.2071 11.4647 17.2099 11.4932 17.2128C12.6277 17.3312 14.2192 16.9703 15.8079 16.151C17.7296 15.1592 19.1087 13.7751 19.4396 12.6413C18.9548 12.6043 18.4853 12.4549 18.0683 12.2049C17.4922 11.8719 17.0658 11.4206 16.8668 10.987C16.8386 10.9258 16.8147 10.8627 16.7955 10.7981C16.7445 10.6455 16.7303 10.483 16.7542 10.3239L12.2619 9.58301L10.8215 11.0255Z"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_1030_5486">
        <Rect
          width="18.879"
          height="20"
          fill="#fff"
          transform="translate(0.560486)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);

export interface ItemProps {
  notification: ParsedNotification
  tabType: CharacterNotificationType
}

export function NotificationItem({ notification, tabType }: ItemProps) {
  const titleInfo = getTitleInfo(notification);
  const i18n = useTranslation("common");
  const date = useDate();
  const markAsReadHandler = useCallback(() => {
    GA.logSelectItem({
      content_type: "notification_tab_list_item",
      item_list_id: `notification_tab_${tabType}`,
      item_list_name: `notification_tab_${tabType}`,
      items: [{
        item_category: notification.type,
      }],
    });
  }, [
    notification.type,
    tabType,
  ]);

  return (
    <Card size="$4" bordered marginBottom="$4" paddingHorizontal="$4" onPress={markAsReadHandler}>
      <XStack alignItems="center" gap="$3">
        <Avatar isNavigateToUserInfo useDefault character={notification?.fromCharacter} />
        <YStack paddingVertical="$4" gap="$1.5" flex={1}>
          <Text color="$color" numberOfLines={1}>
            <Text fontWeight={"700"}>
              {getCharacterName(notification)}&nbsp;
            </Text>
            {actionDesc(notification, i18n)}&nbsp;
            {timeDiff(notification, i18n, date)}&nbsp;
          </Text>
          <XStack alignItems="center">
            <Text color="$color">
              {"on "}
            </Text>
            {renderTransactionHash()}
          </XStack>
          {titleInfo && (
            <Text color="$colorSubtitle" numberOfLines={2}>
              {removeMd(titleInfo.title)}
            </Text>
          )}
        </YStack>
      </XStack>
      {!notification.isReadBefore && <Circle backgroundColor={"$red10"} size="$0.25" position="absolute" right={"$2"} top={"$3"}/>}
    </Card>
  );
}

function getTitleInfo(
  notification: ParsedNotification,
) {
  switch (notification.type) {
    case "comment-note":
      return {
        title: getNoteTitle(notification.commentNote),
      };
    case "like-note":
    case "mint-note":
      return {
        title: getNoteTitle(notification.originNote),
      };
    case "tip-note":
      return {
        title: getNoteTitle(notification.toNote),
      };
    case "mention":
      return {
        title: getNoteTitle(notification.fromNote),
      };
  }

  return null;
}

function getNoteTitle(note: NoteEntity | undefined) {
  return (
    note?.metadata?.content?.title || note?.metadata?.content?.content || "Note"
  );
}

function renderTransactionHash() {
  return (
    <XStack alignItems="center" gap="$1">
      <CrossbellChainLogo color="#F6C549" width={14} height={14} />
      <Text color="#F6C549">
        Crossbell Chain
      </Text>
    </XStack>
  );
}

function timeDiff(
  notification: ParsedNotification,
  i18n: UseTranslationResponse<"common", undefined>,
  date: ReturnType<typeof useDate>,
) {
  return i18n.t("ago", {
    time: date.dayjs
      .duration(
        date
          .dayjs(notification.createdAt)
          .diff(date.dayjs(), "minute"),
        "minute",
      )
      .humanize(),
  });
}

function getCharacterName(notification: ParsedNotification) {
  switch (notification.type) {
    case "mint-note":
      return notification.fromCharacter
        ? notification.fromCharacter?.metadata?.content?.name
        : notification.fromAddress;
    default:
      return notification.fromCharacter?.metadata?.content?.name;
  }
}

function actionDesc(
  notification: ParsedNotification,
  i18n: UseTranslationResponse<"common", undefined>,
) {
  switch (notification.type) {
    case "comment-note":
      return (
        <Text>{i18n.t("commented your Note")}</Text>
      );
    case "like-note":
      return <Text>{i18n.t("liked your Note")}</Text>;
    case "mint-note":
      return <Text>{i18n.t("minted your Note")}</Text>;
    case "follow-character":
      return <Text>{i18n.t("followed you")}</Text>;
    case "tip-note":
      return (
        <Text>
          {`tipped you ${formatUnits(notification.amount, 18)} `}
          MIRA
          {" on your Note"}
        </Text>
      );
    case "tip-character":
      return (
        <Text>
          {`tipped you ${formatUnits(notification.amount, 18)} `}
          MIRA
        </Text>
      );
    case "mention":
      return <Text>{i18n.t("mentioned you")}</Text>;
  }
}
