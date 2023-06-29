import type { FC } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, TextInput } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Search } from "@tamagui/lucide-icons";
import type { CharacterEntity } from "crossbell";
import { Text, ListItem, SizableText, Stack, XStack, YGroup, YStack, Button } from "tamagui";

import { Avatar } from "@/components/Avatar";
import type { RootStackParamList } from "@/navigation/types";
import { useGetShowcase } from "@/queries/home";

import topics from "../../data/topics.json";

export interface Props {
  sortType?: any
}

const { width } = Dimensions.get("window");
const ITEM_HORIZONTAL_GAP = 24;
const ITEM_VERTICAL_GAP = 8;
const ITEM_WIDTH = width - 2 * ITEM_HORIZONTAL_GAP;
const ITEM_HEIGHT = 100 + 2 * ITEM_VERTICAL_GAP;

export const SearchPage: FC<NativeStackScreenProps<RootStackParamList, "Search">> = (props) => {
  const { navigation } = props;
  const i18n = useTranslation("common");
  const showcaseSites = useGetShowcase();
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1 }} >
      <Animated.View entering={FadeInRight.duration(500)} >
        <XStack alignItems="center" marginHorizontal={10} gap={"$2"}>
          <XStack
            borderWidth={1}
            borderRadius={"$4"}
            borderColor={"$borderColor"}
            height={"$4"}
            alignItems={"center"}
            paddingHorizontal={"$3"}
            gap="$2"
            paddingVertical={2}
            flex={1}
          >
            <Search color="$colorSubtitle" size={"$1"}/>
            <TextInput autoFocus onChangeText={setSearch}/>
          </XStack>
          <Button onPress={navigation.goBack}>{i18n.t("Cancel")}</Button>
        </XStack>
      </Animated.View>
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
