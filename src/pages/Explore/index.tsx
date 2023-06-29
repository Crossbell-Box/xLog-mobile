import type { FC } from "react";
import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import type Animated from "react-native-reanimated";
import { Easing, Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Search } from "@tamagui/lucide-icons";
import type { CharacterEntity } from "crossbell";
import { Text, ListItem, SizableText, Stack, XStack, YGroup, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { MeasuredContainer } from "@/components/MeasuredContainer";
import { useRootNavigation } from "@/hooks/use-navigation";
import type { HomeBottomTabsParamList } from "@/navigation/types";
import { RootStackParamList } from "@/navigation/types";
import { useGetShowcase } from "@/queries/home";
import { withAnchorPoint } from "@/utils/anchor-point";

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
      <ScrollView style={{ flex: 1, paddingHorizontal: 12, paddingTop: 18 }}>
        <YStack marginBottom={"$3"}>
          <SizableText fontWeight={"700"} color="$color" size="$6">{i18n.t("Hot Topics")}</SizableText>
          {topics.map((topic: any) => (
            <ListItem paddingHorizontal={0} key={topic.name} title={i18n.t(topic.name)} subTitle={i18n.t(topic.description)}/>
          ))}
        </YStack>
        {/* <YStack>
          <SizableText fontWeight={"700"} color="$color" size="$6">{i18n.t("Suggested creators for you")}</SizableText>
          {showcaseSites.data?.map(item => (
            <CharacterCard item={item} key={item.characterId} />
          ))}
        </YStack> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const CharacterCard: FC<{
  item: CharacterEntity
}> = (props) => {
  const { item } = props;

  return (
    <XStack height={ITEM_HEIGHT} paddingBottom={ITEM_VERTICAL_GAP} backgroundColor={"$background"}>
      <XStack flex={1} alignItems="center" gap="$3" borderWidth={1} borderColor={"$borderColor"} borderRadius={"$5"} paddingHorizontal={"$3"}>
        <Avatar size={42} character={item} isNavigateToUserInfo={false}/>
        <YStack flex={1} gap="$2">
          <Text numberOfLines={1} color={"$color"} fontSize={"$7"} fontWeight={"$10"}>{item.metadata?.content?.name}</Text>
          {item.metadata?.content?.bio && <Text color="$colorSubtitle" numberOfLines={2}>{item.metadata?.content?.bio}</Text>}
        </YStack>
      </XStack>
    </XStack>
  );
};
