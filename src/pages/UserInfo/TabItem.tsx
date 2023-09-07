import type { FC } from "react";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import type { Route, TabView } from "@showtime-xyz/tab-view";
import { LinearGradient } from "expo-linear-gradient";
import { Spinner, Stack, Text } from "tamagui";

import { useRootNavigation } from "@/hooks/use-navigation";
import { getPage } from "@/models/page.model";
import type { ExpandedNote } from "@/types/crossbell";

import { LinkType, analyzingLink, disabledPages, isDisabledLink, isHomePage } from "./analyzingLink";

type TabBarProps = Parameters<React.ComponentProps<typeof TabView>["renderTabBar"]>[0];

interface TabBarItemProps extends TabBarProps {
  isActive: boolean
  characterId: number
  link: Route
  onPressTab: (link: Route, note?: ExpandedNote) => void
}

export const TabItemRenderer: FC<{
  isActive: boolean
  isLoading: boolean
  title: string
  onPressTab?: () => void
}> = ({
  isActive,
  isLoading,
  title,
  onPressTab,
}) => {
  return (
    <Stack onPress={onPressTab} paddingBottom="$2">
      {
        isLoading
          ? <Spinner size="small" />
          : <Text color={"$color"}>{title}</Text>
      }

      {
        isActive && (
          <Stack height={2} width={"100%"} marginTop="$1">
            <LinearGradient
              colors={["#30a19b", "#2875bf"]}
              style={{ position: "absolute", width: "100%", top: 0, bottom: 0 }}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            />
          </Stack>
        )
      }
    </Stack>
  );
};

export const TabItem: FC<TabBarItemProps> = (props) => {
  const { isActive, characterId, link, jumpTo, onPressTab } = props;
  const i18n = useTranslation();
  const [note, setNote] = useState<ExpandedNote | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const internalTab = useRef(analyzingLink(link)).current;

  useEffect(() => {
    if (
      internalTab.type === LinkType.POST && !note
    ) {
      setLoading(true);
      const slug = link.key.split("/")[1];
      getPage({ slug, characterId })
        .then(r => (r?.noteId && setNote(r)))
        .finally(() => setLoading(false));
    }
  }, [characterId, link, note]);

  if (
    !isHomePage(link.key)
      && isDisabledLink(link.key)
      && internalTab.type !== LinkType.EXTERNAL
  ) return null;

  return (
    <TabItemRenderer
      isActive={isActive}
      isLoading={loading}
      title={i18n.t(link.title)}
      onPressTab={() => onPressTab(link, internalTab.type === LinkType.POST ? note : undefined)}
    />
  );
};

