import type { FC } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Search } from "@tamagui/lucide-icons";
import type { CharacterEntity } from "crossbell";
import { Text, ListItem, SizableText, Stack, XStack, YStack, Spinner } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { useNavigateToUserInfo } from "@/hooks/use-navigate-to-user-info";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { HomeBottomTabsParamList } from "@/navigation/types";
import { useGetShowcase } from "@/queries/home";
import { GA } from "@/utils/GA";

import topics from "../../data/topics.json";

export interface Props {
  sortType?: any
}

const ITEM_VERTICAL_GAP = 8;
const ITEM_HEIGHT = 100 + 2 * ITEM_VERTICAL_GAP;

export const ExplorePage: FC<NativeStackScreenProps<HomeBottomTabsParamList, "Explore">> = (props) => {
  const i18n = useTranslation("common");
  const showcaseSites = useGetShowcase();
  const navigation = useRootNavigation();

  const onPressTopicItem = useCallback((topic: (typeof topics)[number]) => {
    GA.logSelectItem({
      content_type: "explore_page_topic",
      item_list_id: "explore_page_topic_list",
      item_list_name: "explore_page_topic_list",
      items: [{
        item_id: topic.name,
        item_name: i18n.t(topic.name),
      }],
    });
  }, []);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} >
      <XStack
        onPress={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigation.navigate("Search");
        }}
        borderWidth={1}
        borderRadius={"$4"}
        borderColor={"$borderColor"}
        height={"$4"}
        alignItems={"center"}
        paddingHorizontal={"$3"}
        marginHorizontal={10}
        gap="$2"
      >
        <Search color="$colorSubtitle" size={"$1"}/>
        <SizableText color="$colorSubtitle" size="$5">{i18n.t("Search for your interest")}</SizableText>
      </XStack>
      <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 18 }} contentContainerStyle={{ paddingBottom: 150 }}>
        <YStack marginBottom={"$3"}>
          <XStack alignItems="center">
            <Stack borderLeftColor={"$primary"} borderLeftWidth={3} height="$0.5" marginRight="$2"/>
            <SizableText fontWeight={"700"} color="$color" size="$6">{i18n.t("Hot Topics")}</SizableText>
          </XStack>
          {topics.sort((a, b) => (a.description || "")?.length - (b.description || "")?.length).map((topic) => {
            return <ListItem onPress={() => onPressTopicItem(topic)} paddingHorizontal={4} key={topic.name} title={i18n.t(topic.name)} subTitle={i18n.t(topic.description)}/>;
          })}
        </YStack>
        {
          showcaseSites.data?.length
            ? (
              <YStack>
                <XStack alignItems="center" marginBottom="$3">
                  <Stack borderLeftColor={"$primary"} borderLeftWidth={3} height="$0.5" marginRight="$2"/>
                  <SizableText fontWeight={"700"} color="$color" size="$6">{i18n.t("Suggested creators for you")}</SizableText>
                </XStack>
                {showcaseSites.data?.slice(0, 15)?.map(item => <CharacterCard item={item} key={item.characterId} />)}
              </YStack>
            )
            : (
              <Spinner marginTop="$4"/>
            )
        }
      </ScrollView>
    </SafeAreaView>
  );
};

const CharacterCard: FC<{
  item: CharacterEntity
}> = (props) => {
  const { item } = props;
  const { navigateToUserInfo } = useNavigateToUserInfo(props.item);

  const onHandleAvatarPress = useCallback(() => {
    navigateToUserInfo();
    GA.logSelectItem({
      content_type: "explore_page_creator",
      item_list_id: "explore_page_creator_list",
      item_list_name: "explore_page_creator_list",
      items: [{
        item_id: item?.characterId?.toString(),
        item_name: item.metadata?.content?.name,
      }],
    });
  }, [item]);

  return (
    <XStack onPress={onHandleAvatarPress} height={ITEM_HEIGHT} paddingBottom={ITEM_VERTICAL_GAP} backgroundColor={"$background"}>
      <XStack flex={1} alignItems="center" gap="$3" borderWidth={1} borderColor={"$borderColor"} borderRadius={"$5"} paddingHorizontal={"$3"}>
        <Avatar size={42} character={item} useDefault/>
        <YStack flex={1} gap="$2">
          <Text numberOfLines={1} color={"$color"} fontSize={"$7"} fontWeight={"$10"}>{item.metadata?.content?.name}</Text>
          {item.metadata?.content?.bio && <Text color="$colorSubtitle" numberOfLines={2}>{item.metadata?.content?.bio}</Text>}
        </YStack>
      </XStack>
    </XStack>
  );
};
