import { useEffect, type FC } from "react";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FlashList } from "@shopify/flash-list";
import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import type { CharacterEntity, ListResponse } from "crossbell";
import { useWindowDimensions } from "tamagui";

import type { RootStackParamList } from "@/navigation/types";
import { useGetLikes, useGetMints } from "@/queries/page";

import CharacterListItem from "./CharacterListItem";

export interface Props {
  title?: string
  characterId?: number
  noteId?: number
  type: "like" | "mint"
}

export const CharacterListPage: FC<NativeStackScreenProps<RootStackParamList, "CharacterListPage">> = (props) => {
  const { title, characterId, noteId, type } = props.route.params;
  const { height, width } = useWindowDimensions();
  const { bottom, top } = useSafeAreaInsets();

  let list: CharacterEntity[];
  let mutation: UseInfiniteQueryResult<ListResponse<unknown>, unknown>;

  switch (type) {
    case "like":{
      const likes = useGetLikes({
        characterId,
        noteId,
      });

      list = likes[0].map(item => item?.character);

      mutation = likes[1];

      break;
    }
    case "mint":
    {
      const mints = useGetMints({
        characterId,
        noteId,
        includeCharacter: true,
      });

      list = mints.data?.pages?.flatMap?.(page => page?.list?.map(item => item.character));

      mutation = mints;
      break;
    }
  }

  useEffect(() => {
    if (title) {
      props.navigation.setOptions({
        title,
      });
    }
  }, [title]);

  return (
    <Animated.View style={{ flex: 1 }}>
      <FlashList
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (
            !mutation.hasNextPage
            || mutation.isFetchingNextPage
            || mutation.isFetching
          ) {
            return;
          }

          mutation.fetchNextPage();
        }}
        contentContainerStyle={{ paddingBottom: bottom }}
        data={list}
        keyExtractor={(item: CharacterEntity) => item?.blockNumber?.toString?.()}
        estimatedItemSize={100}
        estimatedListSize={{
          height: height - top - bottom,
          width,
        }}
        renderItem={({ item, index }: { item: CharacterEntity; index: number }) => {
          return (
            <CharacterListItem
              key={index}
              sub={item}
              character={item}
            />
          );
        }}
      />
    </Animated.View>
  );
};
